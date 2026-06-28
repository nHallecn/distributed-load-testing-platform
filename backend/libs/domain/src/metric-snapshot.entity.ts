import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TestRunEntity } from './test-run.entity';

@Entity({ name: 'metric_snapshots' })
@Index(['runId', 'recordedAt'])
export class MetricSnapshotEntity {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'run_id', type: 'uuid' })
  runId: string;

  @ManyToOne(() => TestRunEntity, (run) => run.metrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'run_id' })
  run: TestRunEntity;

  @Column({ name: 'worker_id', type: 'uuid', nullable: true })
  workerId: string | null;

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
