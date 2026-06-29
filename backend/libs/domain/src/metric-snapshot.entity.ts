import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TestRunEntity } from './test-run.entity';
import { WorkerEntity } from './worker.entity';

@Entity({ name: 'metric_snapshots' })
@Index('idx_metric_snapshots_run_recorded', ['runId', 'recordedAt'])
export class MetricSnapshotEntity {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'run_id', type: 'uuid' })
  runId: string;

  @ManyToOne(() => TestRunEntity, (run) => run.metrics, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'run_id',
    foreignKeyConstraintName: 'metric_snapshots_run_id_fkey',
  })
  run: TestRunEntity;

  @Column({ name: 'worker_id', type: 'uuid', nullable: true })
  workerId: string | null;

  @ManyToOne(() => WorkerEntity, { onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'worker_id',
    foreignKeyConstraintName: 'metric_snapshots_worker_id_fkey',
  })
  worker: WorkerEntity | null;

  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt: Date;

  @Column({ name: 'requests_per_second', type: 'double precision' })
  requestsPerSecond: number;

  @Column({ name: 'total_requests', type: 'bigint' })
  totalRequests: string;

  @Column({ name: 'failed_requests', type: 'bigint' })
  failedRequests: string;

  @Column({ name: 'p95_latency_ms', type: 'double precision' })
  p95LatencyMs: number;

  @Column({ name: 'latency_sum_ms', type: 'double precision' })
  latencySumMs: number;

  @Column({ name: 'latency_buckets', type: 'jsonb', default: {} })
  latencyBuckets: Record<string, number>;

  @Column({ name: 'active_virtual_users', type: 'integer' })
  activeVirtualUsers: number;

  @Column({ name: 'status_codes', type: 'jsonb', default: {} })
  statusCodes: Record<string, number>;
}
