import { RunStatus } from '@app/config';
import {
  Column,
  Check,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { LoadTestEntity } from './load-test.entity';
import { MetricSnapshotEntity } from './metric-snapshot.entity';
import { WorkerEntity } from './worker.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'test_runs' })
@Index('idx_test_runs_test_created', ['testId', 'createdAt'])
@Index('idx_one_active_run_per_test', ['testId'], {
  unique: true,
  where: `"status" IN ('queued', 'starting', 'running', 'stopping')`,
})
@Check('test_runs_desired_workers_check', '"desired_workers" > 0')
export class TestRunEntity extends BaseEntity {
  @Column({ name: 'test_id', type: 'uuid' })
  testId: string;

  @ManyToOne(() => LoadTestEntity, (test) => test.runs, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'test_id',
    foreignKeyConstraintName: 'test_runs_test_id_fkey',
  })
  test: LoadTestEntity;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'requested_by',
    foreignKeyConstraintName: 'test_runs_requested_by_fkey',
  })
  requester: UserEntity;

  @Column({
    type: 'enum',
    enum: RunStatus,
    enumName: 'run_status',
    default: RunStatus.QUEUED,
  })
  status: RunStatus;

  @Column({ name: 'desired_workers', type: 'integer' })
  desiredWorkers: number;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @Column({ name: 'stop_reason', type: 'text', nullable: true })
  stopReason: string | null;

  @Column({ name: 'total_requests', type: 'bigint', default: 0 })
  totalRequests: string;

  @Column({ name: 'successful_requests', type: 'bigint', default: 0 })
  successfulRequests: string;

  @Column({ name: 'failed_requests', type: 'bigint', default: 0 })
  failedRequests: string;

  @Column({ name: 'average_latency_ms', type: 'double precision', nullable: true })
  averageLatencyMs: number | null;

  @Column({ name: 'p95_latency_ms', type: 'double precision', nullable: true })
  p95LatencyMs: number | null;

  @Column({ name: 'p99_latency_ms', type: 'double precision', nullable: true })
  p99LatencyMs: number | null;

  @Column({ name: 'error_rate_percent', type: 'double precision', nullable: true })
  errorRatePercent: number | null;

  @OneToMany(() => WorkerEntity, (worker) => worker.run)
  workers: WorkerEntity[];

  @OneToMany(() => MetricSnapshotEntity, (metric) => metric.run)
  metrics: MetricSnapshotEntity[];
}
