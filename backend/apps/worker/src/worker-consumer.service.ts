import {
  EXECUTE_TEST_JOB,
  ExecuteTestJob,
  redisOptionsFromUrl,
} from '@app/queue';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import Redis from 'ioredis';
import { hostname } from 'node:os';
import { LoadGeneratorService } from './load-generator.service';

@Injectable()
export class WorkerConsumerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(WorkerConsumerService.name);
  private consumer: Worker<ExecuteTestJob>;
  private redis: Redis;

  constructor(
    private readonly config: ConfigService,
    private readonly generator: LoadGeneratorService,
  ) {}

  onApplicationBootstrap() {
    const connection = redisOptionsFromUrl(
      this.config.getOrThrow<string>('REDIS_URL'),
    );
    this.redis = new Redis(connection);
    const queueName = this.config.get<string>(
      'WORKER_QUEUE_NAME',
      'load-test-jobs',
    );
    this.consumer = new Worker<ExecuteTestJob>(
      queueName,
      (job) => this.process(job),
      { connection, concurrency: 1 },
    );
    this.consumer.on('failed', (job, error) => {
      this.logger.error(`Job ${job?.id ?? 'unknown'} failed`, error.stack);
      if (job) {
        void this.generator.markJobFailed(job.data).catch((failure) => {
          this.logger.error(
            `Could not persist failure for job ${job.id}`,
            failure instanceof Error ? failure.stack : undefined,
          );
        });
      }
    });
    this.logger.log(`Listening for jobs on ${queueName}`);
  }

  private async process(job: Job<ExecuteTestJob>) {
    if (job.name !== EXECUTE_TEST_JOB) return;
    await this.generator.execute(
      job.data,
      `${hostname()}:${process.pid}`,
      this.redis,
      this.config.get<number>('TARGET_REQUEST_TIMEOUT_MS', 10_000),
    );
  }

  async onApplicationShutdown() {
    await Promise.all([this.consumer?.close(), this.redis?.quit()]);
  }
}
