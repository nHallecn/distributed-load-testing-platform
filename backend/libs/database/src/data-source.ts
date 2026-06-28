import 'dotenv/config';
import {
  AuditLogEntity,
  LoadTestEntity,
  MetricSnapshotEntity,
  TargetVerificationEntity,
  TestRunEntity,
  UserEntity,
  WorkerEntity,
} from '@app/domain';
import { DataSource } from 'typeorm';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to configure the data source');
}

export const entities = [
  UserEntity,
  TargetVerificationEntity,
  LoadTestEntity,
  TestRunEntity,
  WorkerEntity,
  MetricSnapshotEntity,
  AuditLogEntity,
];

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : false,
  entities,
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
