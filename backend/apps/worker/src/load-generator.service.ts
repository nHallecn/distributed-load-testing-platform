import { RunStatus } from '@app/config';
import {
  MetricSnapshotEntity,
  TestRunEntity,
  WorkerEntity,
} from '@app/domain';
import { ExecuteTestJob } from '@app/queue';
import { UrlPolicyService } from '@app/safety';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

const LATENCY_BUCKETS_MS = [
  5, 10, 25, 50, 100, 250, 500, 1_000, 2_500, 5_000, 10_000, 30_000, 60_000,
];

class WindowMetrics {
  total = 0;
  failed = 0;
  latencySumMs = 0;
  readonly statusCodes: Record<string, number> = {};
  readonly latencyBuckets: Record<string, number> = Object.fromEntries(
    LATENCY_BUCKETS_MS.map((bucket) => [String(bucket), 0]),
  );

  record(latencyMs: number, statusCode?: number) {
    this.total += 1;
    this.latencySumMs += latencyMs;
    if (!statusCode || statusCode < 200 || statusCode >= 400) {
      this.failed += 1;
    }
    const status = statusCode ? String(statusCode) : 'network_error';
    this.statusCodes[status] = (this.statusCodes[status] ?? 0) + 1;
    for (const boundary of LATENCY_BUCKETS_MS) {
      if (latencyMs <= boundary) {
        this.latencyBuckets[String(boundary)] += 1;
      }
    }
  }

  percentile(percent: number) {
    if (this.total === 0) return 0;
    const target = Math.ceil(this.total * percent);
    for (const boundary of LATENCY_BUCKETS_MS) {
      if (this.latencyBuckets[String(boundary)] >= target) return boundary;
    }
    return 60_000;
  }
}

@Injectable()
export class LoadGeneratorService {
  constructor(
    @InjectRepository(TestRunEntity)
    private readonly runs: Repository<TestRunEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workers: Repository<WorkerEntity>,
    @InjectRepository(MetricSnapshotEntity)
    private readonly snapshots: Repository<MetricSnapshotEntity>,
    private readonly urlPolicy: UrlPolicyService,
  ) {}

  async execute(
    job: ExecuteTestJob,
    workerKey: string,
    redis: Redis,
    timeoutMs: number,
  ) {
    await this.urlPolicy.assertPublicHttpUrl(job.targetUrl);
    const record = await this.getOrCreateWorker(job, workerKey);
    record.status = 'running';
    record.lastHeartbeatAt = new Date();
    await this.workers.save(record);
    await this.markRunStarted(job.runId);

    let window = new WindowMetrics();
    let activeVirtualUsers = 0;
    let shouldStop = false;
    const deadline = Date.now() + job.durationSeconds * 1_000;

    let reportInFlight = Promise.resolve();
    let isReporting = false;
    const reportWindow = async () => {
      const snapshot = window;
      window = new WindowMetrics();
      try {
        await this.persistSnapshot(
          job.runId,
          record.id,
          snapshot,
          activeVirtualUsers,
        );
        record.lastHeartbeatAt = new Date();
        await this.workers.update(record.id, {
          lastHeartbeatAt: record.lastHeartbeatAt,
        });
        if (this.stopConditionReached(job, snapshot)) {
          shouldStop = true;
          await redis.set(
            `loadtest:run:${job.runId}:cancelled`,
            'safety-condition',
            'EX',
            86_400,
          );
        }
        if (await redis.get(`loadtest:run:${job.runId}:cancelled`)) {
          shouldStop = true;
        }
        const currentRun = await this.runs.findOne({
          where: { id: job.runId },
          select: { status: true },
        });
        if (
          currentRun?.status === RunStatus.STOPPING ||
          currentRun?.status === RunStatus.CANCELLED
        ) {
          shouldStop = true;
        }
      } catch {
        shouldStop = true;
      }
    };
    const reporter = setInterval(() => {
      if (isReporting) return;
      isReporting = true;
      reportInFlight = reportWindow().finally(() => {
        isReporting = false;
      });
    }, 1_000);

    try {
      const virtualUsers = Array.from(
        { length: job.virtualUsers },
        async (_, index) => {
          const delay =
            job.virtualUsers <= 1
              ? 0
              : Math.floor(
                  (job.rampUpSeconds * 1_000 * index) / job.virtualUsers,
                );
          await this.delay(delay);
          if (shouldStop || Date.now() >= deadline) return;
          activeVirtualUsers += 1;
          try {
            while (!shouldStop && Date.now() < deadline) {
              const result = await this.request(job, timeoutMs);
              window.record(result.latencyMs, result.statusCode);
            }
          } finally {
            activeVirtualUsers -= 1;
          }
        },
      );
      await Promise.all(virtualUsers);
      clearInterval(reporter);
      await reportInFlight;
      await this.persistSnapshot(job.runId, record.id, window, 0);
      record.status = shouldStop ? 'cancelled' : 'completed';
      await this.workers.save(record);
    } catch (error) {
      clearInterval(reporter);
      await reportInFlight;
      record.status = 'failed';
      await this.workers.save(record);
      await this.finalizeRun(job.runId);
      throw error;
    }

    await this.finalizeRun(job.runId);
  }

  async markJobFailed(job: ExecuteTestJob) {
    const record = await this.getOrCreateWorker(job, 'unassigned');
    record.status = 'failed';
    await this.workers.save(record);
    await this.finalizeRun(job.runId);
  }

  private async request(job: ExecuteTestJob, timeoutMs: number) {
    const startedAt = performance.now();
    try {
      const hasBody = job.body !== null && !['GET', 'HEAD'].includes(job.method);
      const response = await fetch(job.targetUrl, {
        method: job.method,
        headers: job.headers,
        body: hasBody ? JSON.stringify(job.body) : undefined,
        redirect: 'error',
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.body) {
        await response.body.pipeTo(new WritableStream({ write() {} }));
      }
      return {
        latencyMs: performance.now() - startedAt,
        statusCode: response.status,
      };
    } catch {
      return { latencyMs: performance.now() - startedAt };
    }
  }

  private async getOrCreateWorker(job: ExecuteTestJob, workerKey: string) {
    const key = `partition-${job.partition}`;
    const existing = await this.workers.findOne({
      where: { runId: job.runId, workerKey: key },
    });
    if (existing) {
      if (workerKey !== 'unassigned') {
        existing.executorKey = workerKey;
      }
      return existing;
    }
    return (
      this.workers.create({
        runId: job.runId,
        workerKey: key,
        executorKey: workerKey,
        capacity: job.virtualUsers,
      })
    );
  }

  private async markRunStarted(runId: string) {
    await this.runs
      .createQueryBuilder()
      .update(TestRunEntity)
      .set({ status: RunStatus.RUNNING, startedAt: () => 'COALESCE(started_at, now())' })
      .where('id = :runId', { runId })
      .andWhere('status IN (:...statuses)', {
        statuses: [RunStatus.QUEUED, RunStatus.STARTING],
      })
      .execute();
  }

  private async persistSnapshot(
    runId: string,
    workerId: string,
    metrics: WindowMetrics,
    activeVirtualUsers: number,
  ) {
    if (metrics.total === 0 && activeVirtualUsers === 0) return;
    await this.snapshots.save(
      this.snapshots.create({
        runId,
        workerId,
        recordedAt: new Date(),
        requestsPerSecond: metrics.total,
        totalRequests: String(metrics.total),
        failedRequests: String(metrics.failed),
        p95LatencyMs: metrics.percentile(0.95),
        latencySumMs: metrics.latencySumMs,
        latencyBuckets: metrics.latencyBuckets,
        activeVirtualUsers,
        statusCodes: metrics.statusCodes,
      }),
    );
  }

  private stopConditionReached(job: ExecuteTestJob, metrics: WindowMetrics) {
    if (metrics.total === 0) return false;
    const errorRate = (metrics.failed / metrics.total) * 100;
    return (
      (job.stopConditions.maxErrorRatePercent !== undefined &&
        errorRate >= job.stopConditions.maxErrorRatePercent) ||
      (job.stopConditions.maxP95LatencyMs !== undefined &&
        metrics.percentile(0.95) >= job.stopConditions.maxP95LatencyMs)
    );
  }

  private async finalizeRun(runId: string) {
    await this.runs.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [runId]);
      const run = await manager.findOneByOrFail(TestRunEntity, { id: runId });
      const unfinished = await manager.count(WorkerEntity, {
        where: { runId, status: 'running' },
      });
      const registered = await manager.count(WorkerEntity, { where: { runId } });
      if (unfinished > 0 || registered < run.desiredWorkers) return;
      const failedWorkers = await manager.count(WorkerEntity, {
        where: { runId, status: 'failed' },
      });

      const snapshots = await manager.query<
        Array<{
          total: string;
          failed: string;
          latency_sum: number;
          latency_buckets: Record<string, number>;
        }>
      >(
        `SELECT
          total_requests::text AS total,
          failed_requests::text AS failed,
          latency_sum_ms AS latency_sum,
          latency_buckets
         FROM metric_snapshots WHERE run_id = $1`,
        [runId],
      );
      const aggregate = snapshots.reduce<{
        total: number;
        failed: number;
        latencySum: number;
        buckets: Record<string, number>;
      }>(
        (result, snapshot) => {
          result.total += Number(snapshot.total);
          result.failed += Number(snapshot.failed);
          result.latencySum += snapshot.latency_sum;
          for (const [bucket, count] of Object.entries(
            snapshot.latency_buckets,
          )) {
            result.buckets[bucket] = (result.buckets[bucket] ?? 0) + count;
          }
          return result;
        },
        {
          total: 0,
          failed: 0,
          latencySum: 0,
          buckets: {},
        },
      );
      const cancelled = run.status === RunStatus.STOPPING;
      run.status =
        failedWorkers > 0
          ? RunStatus.FAILED
          : cancelled
            ? RunStatus.CANCELLED
            : RunStatus.COMPLETED;
      run.endedAt = new Date();
      if (failedWorkers > 0) {
        run.stopReason = `${failedWorkers} worker partition(s) failed`;
      }
      run.totalRequests = String(aggregate.total);
      run.failedRequests = String(aggregate.failed);
      run.successfulRequests = String(aggregate.total - aggregate.failed);
      run.averageLatencyMs = aggregate.total
        ? aggregate.latencySum / aggregate.total
        : 0;
      run.p95LatencyMs = this.histogramPercentile(
        aggregate.buckets,
        aggregate.total,
        0.95,
      );
      run.p99LatencyMs = this.histogramPercentile(
        aggregate.buckets,
        aggregate.total,
        0.99,
      );
      run.errorRatePercent = aggregate.total
        ? (aggregate.failed / aggregate.total) * 100
        : 0;
      await manager.save(run);
    });
  }

  private histogramPercentile(
    buckets: Record<string, number>,
    total: number,
    percentile: number,
  ) {
    if (total === 0) return 0;
    const target = Math.ceil(total * percentile);
    for (const boundary of LATENCY_BUCKETS_MS) {
      if ((buckets[String(boundary)] ?? 0) >= target) return boundary;
    }
    return 60_000;
  }

  private delay(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
