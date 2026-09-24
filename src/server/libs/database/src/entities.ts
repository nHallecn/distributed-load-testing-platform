import {
  AuditLogEntity,
  LoadTestEntity,
  MetricSnapshotEntity,
  TargetVerificationEntity,
  TestRunEntity,
  UserEntity,
  WorkerEntity,
} from '@app/domain';

export const entities = [
  UserEntity,
  TargetVerificationEntity,
  LoadTestEntity,
  TestRunEntity,
  WorkerEntity,
  MetricSnapshotEntity,
  AuditLogEntity,
];
