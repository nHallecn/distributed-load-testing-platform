import 'reflect-metadata';
import 'dotenv/config';
import {
  HttpMethod,
  LoadTestStatus,
  RunStatus,
  VerificationMethod,
  VerificationStatus,
} from '@app/config';
import { dataSource } from '@app/database';
import {
  LoadTestEntity,
  TargetVerificationEntity,
  TestRunEntity,
  UserEntity,
} from '@app/domain';
import { redisOptionsFromUrl } from '@app/queue';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';

jest.setTimeout(30_000);

describe('PostgreSQL infrastructure', () => {
  beforeAll(async () => {
    dataSource.setOptions({ logging: false });
    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('has no pending migrations or entity-schema drift', async () => {
    expect(await dataSource.showMigrations()).toBe(false);
    const schemaLog = await dataSource.driver.createSchemaBuilder().log();
    expect(schemaLog.upQueries).toHaveLength(0);
  });

  it('enforces one active run per load test', async () => {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const suffix = randomUUID();
      const user = await queryRunner.manager.save(
        queryRunner.manager.create(UserEntity, {
          email: `integration-${suffix}@example.test`,
          passwordHash: '$2b$12$integration.test.hash.not.for.authentication',
        }),
      );
      const verification = await queryRunner.manager.save(
        queryRunner.manager.create(TargetVerificationEntity, {
          ownerId: user.id,
          hostname: 'example.test',
          method: VerificationMethod.DNS_TXT,
          token: `integration-${suffix}`,
          status: VerificationStatus.VERIFIED,
          verifiedAt: new Date(),
          expiresAt: new Date(Date.now() + 60_000),
          lastError: null,
        }),
      );
      const test = await queryRunner.manager.save(
        queryRunner.manager.create(LoadTestEntity, {
          ownerId: user.id,
          targetVerificationId: verification.id,
          name: 'Infrastructure integration test',
          targetUrl: 'https://example.test/health',
          method: HttpMethod.GET,
          headers: {},
          body: null,
          virtualUsers: 1,
          durationSeconds: 1,
          rampUpSeconds: 0,
          expectedResponseTimeMs: null,
          stopConditions: {},
          status: LoadTestStatus.READY,
        }),
      );
      await queryRunner.manager.save(
        queryRunner.manager.create(TestRunEntity, {
          testId: test.id,
          requestedBy: user.id,
          status: RunStatus.QUEUED,
          desiredWorkers: 1,
        }),
      );

      await expect(
        queryRunner.manager.save(
          queryRunner.manager.create(TestRunEntity, {
            testId: test.id,
            requestedBy: user.id,
            status: RunStatus.RUNNING,
            desiredWorkers: 1,
          }),
        ),
      ).rejects.toMatchObject({
        driverError: { code: '23505' },
      });
    } finally {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
  });
});

describe('Redis and BullMQ infrastructure', () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL is required for infrastructure integration tests');
  }

  const connection = redisOptionsFromUrl(redisUrl);
  const queueName = `loadtest-integration-${randomUUID()}`;
  const redis = new Redis({
    ...connection,
    connectTimeout: 10_000,
    maxRetriesPerRequest: 1,
  });
  const queue = new Queue(queueName, { connection });

  afterAll(async () => {
    await queue.obliterate({ force: true });
    await Promise.all([queue.close(), redis.quit()]);
  });

  it('accepts Redis commands', async () => {
    expect(await redis.ping()).toBe('PONG');
    const key = `${queueName}:probe`;
    await redis.set(key, 'ok', 'EX', 30);
    expect(await redis.get(key)).toBe('ok');
    await redis.del(key);
  });

  it('round-trips an isolated BullMQ job', async () => {
    const job = await queue.add('integration-probe', { healthy: true });
    const persisted = await queue.getJob(job.id!);
    expect(persisted?.name).toBe('integration-probe');
    expect(persisted?.data).toEqual({ healthy: true });
    await persisted?.remove();
  });
});
