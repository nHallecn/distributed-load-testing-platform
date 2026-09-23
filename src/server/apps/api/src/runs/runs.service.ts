import { LoadTestStatus, RunStatus } from '@app/config';
import {
  MetricSnapshotEntity,
  TestRunEntity,
} from '@app/domain';
import { QueuePublisherService } from '@app/queue';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LoadTestsService } from '../load-tests/load-tests.service';
import { RunStateService } from './run-state.service';
import { AuditService } from '../audit/audit.service';
import { TargetVerificationService } from '../targets/target-verification.service';

@Injectable()
export class RunsService {
  constructor(
    @InjectRepository(TestRunEntity)
    private readonly runs: Repository<TestRunEntity>,
    @InjectRepository(MetricSnapshotEntity)
    private readonly metrics: Repository<MetricSnapshotEntity>,
    private readonly loadTests: LoadTestsService,
    private readonly queue: QueuePublisherService,
    private readonly state: RunStateService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly targets: TargetVerificationService,
  ) {}

  async start(ownerId: string, testId: string) {
    const test = await this.loadTests.getOwned(ownerId, testId);
    if (test.status !== LoadTestStatus.READY) {
      throw new ConflictException(
        'The test is not ready. Complete target verification first.',
      );
    }
    if (
      this.config.get<boolean>('TARGET_VERIFICATION_REQUIRED', true) &&
      !(await this.targets.findVerifiedForTarget(ownerId, test.targetUrl))
    ) {
      throw new ConflictException(
        'Target verification has expired. Verify ownership again before running this test.',
      );
    }

    const active = await this.runs.exists({
      where: {
        testId,
        status: In([
          RunStatus.QUEUED,
          RunStatus.STARTING,
          RunStatus.RUNNING,
          RunStatus.STOPPING,
        ]),
      },
    });
    if (active) {
      throw new ConflictException('This test already has an active run');
    }

    const capacity = this.config.get<number>('WORKER_CAPACITY', 500);
    const run = await this.runs.save(
      this.runs.create({
        testId,
        requestedBy: ownerId,
        desiredWorkers: Math.ceil(test.virtualUsers / capacity),
        status: RunStatus.QUEUED,
      }),
    );

    try {
      await this.queue.publishRun(run, test, capacity);
    } catch {
      run.status = RunStatus.FAILED;
      run.endedAt = new Date();
      run.stopReason = 'Unable to dispatch worker jobs';
      await this.runs.save(run);
      throw new ServiceUnavailableException(
        'The run could not be dispatched. Try again shortly.',
      );
    }
    await this.audit.record({
      actorId: ownerId,
      action: 'run.started',
      resourceType: 'test_run',
      resourceId: run.id,
      metadata: {
        testId,
        desiredWorkers: run.desiredWorkers,
        virtualUsers: test.virtualUsers,
      },
    });
    return run;
  }

  async stop(ownerId: string, runId: string) {
    const run = await this.getOwned(ownerId, runId);
    this.state.assertTransition(run.status, RunStatus.STOPPING);
    run.status = RunStatus.STOPPING;
    run.stopReason = 'Stopped by user';
    await this.runs.save(run);
    await this.queue.requestStop(run.id);
    await this.audit.record({
      actorId: ownerId,
      action: 'run.stop_requested',
      resourceType: 'test_run',
      resourceId: run.id,
    });
    return run;
  }

  async getOwned(ownerId: string, id: string) {
    const run = await this.runs.findOne({
      where: { id, test: { ownerId } },
      relations: { test: true },
    });
    if (!run) {
      throw new NotFoundException('Test run was not found');
    }
    return run;
  }

  async getMetrics(ownerId: string, runId: string) {
    await this.getOwned(ownerId, runId);
    return this.metrics.find({
      where: { runId },
      order: { recordedAt: 'ASC' },
      take: 3_600,
    });
  }

  async getReport(ownerId: string, runId: string) {
    const run = await this.getOwned(ownerId, runId);
    if (!this.state.isTerminal(run.status)) {
      throw new ConflictException(
        'The report is available only after the run finishes',
      );
    }
    return {
      runId: run.id,
      status: run.status,
      startedAt: run.startedAt,
      endedAt: run.endedAt,
      totalRequests: run.totalRequests,
      successfulRequests: run.successfulRequests,
      failedRequests: run.failedRequests,
      averageLatencyMs: run.averageLatencyMs,
      p95LatencyMs: run.p95LatencyMs,
      p99LatencyMs: run.p99LatencyMs,
      errorRatePercent: run.errorRatePercent,
      stopReason: run.stopReason,
    };
  }
}
