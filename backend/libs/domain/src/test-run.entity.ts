import { RunStatus } from '@app/config';
import {
  Column,
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

@Entity({ name: 'test_runs' })
@Index(['testId', 'createdAt'])
export class TestRunEntity extends BaseEntity {
  @Column({ name: 'test_id', type: 'uuid' })
  testId: string;

  @ManyToOne(() => LoadTestEntity, (test) => test.runs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: LoadTestEntity;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy: string;

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
