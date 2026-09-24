import { LoadTestEntity, TestRunEntity } from '@app/domain';
import {
  Injectable,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { EXECUTE_TEST_JOB, ExecuteTestJob } from './contracts';
import { redisOptionsFromUrl } from './redis-options';

@Injectable()
export class QueuePublisherService implements OnApplicationShutdown {
  private readonly queue: Queue<ExecuteTestJob>;
  private readonly redis: Redis;

  constructor(config: ConfigService) {
    const connection = redisOptionsFromUrl(
      config.getOrThrow<string>('REDIS_URL'),
    );
    this.queue = new Queue<ExecuteTestJob>(
      config.get<string>('WORKER_QUEUE_NAME', 'load-test-jobs'),
      { connection },
    );
    this.redis = new Redis(connection);
  }

  async publishRun(run: TestRunEntity, test: LoadTestEntity, capacity: number) {
    const jobs = Array.from({ length: run.desiredWorkers }, (_, index) => {
      const assignedUsers = Math.min(
        capacity,
        test.virtualUsers - index * capacity,
      );
      const payload: ExecuteTestJob = {
        runId: run.id,
        testId: test.id,
        partition: index,
        totalPartitions: run.desiredWorkers,
        virtualUsers: assignedUsers,
        targetUrl: test.targetUrl,
        method: test.method,
        headers: test.headers,
        body: test.body,
        durationSeconds: test.durationSeconds,
        rampUpSeconds: test.rampUpSeconds,
        stopConditions: test.stopConditions,
      };
      return {
        name: EXECUTE_TEST_JOB,
        data: payload,
        opts: {
          jobId: `${run.id}:${index}`,
          attempts: 1,
          removeOnComplete: 1_000,
          removeOnFail: 5_000,
        },
      };
    });
    await this.queue.addBulk(jobs);
  }

  async requestStop(runId: string) {
    await this.redis.set(`loadtest:run:${runId}:cancelled`, '1', 'EX', 86_400);
  }

  async onApplicationShutdown() {
    await Promise.all([this.queue.close(), this.redis.quit()]);
  }
}
