import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { TestRunEntity } from './test-run.entity';

@Entity({ name: 'workers' })
@Unique('workers_run_id_worker_key_key', ['runId', 'workerKey'])
export class WorkerEntity extends BaseEntity {
  @Column({ name: 'run_id', type: 'uuid' })
  runId: string;

  @ManyToOne(() => TestRunEntity, (run) => run.workers, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'run_id',
    foreignKeyConstraintName: 'workers_run_id_fkey',
  })
  run: TestRunEntity;

  @Column({ name: 'worker_key', length: 150 })
  workerKey: string;

  @Column({
    name: 'executor_key',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  executorKey: string | null;

  @Column({ type: 'integer' })
  capacity: number;

  @Column({ length: 30, default: 'assigned' })
  status: string;

  @Column({ name: 'last_heartbeat_at', type: 'timestamptz', nullable: true })
  lastHeartbeatAt: Date | null;
}
