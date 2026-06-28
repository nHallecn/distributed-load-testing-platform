import {
  HttpMethod,
  LoadTestStatus,
} from '@app/config';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { TestRunEntity } from './test-run.entity';
import { UserEntity } from './user.entity';

export interface StopConditions {
  maxErrorRatePercent?: number;
  maxP95LatencyMs?: number;
}

@Entity({ name: 'load_tests' })
@Index(['ownerId', 'createdAt'])
export class LoadTestEntity extends BaseEntity {
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => UserEntity, (user) => user.tests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @Column({ name: 'target_verification_id', type: 'uuid', nullable: true })
  targetVerificationId: string | null;

  @Column({ length: 120 })
  name: string;

  @Column({ name: 'target_url', type: 'text' })
  targetUrl: string;

  @Column({ type: 'enum', enum: HttpMethod, enumName: 'http_method' })
  method: HttpMethod;

  @Column({ type: 'jsonb', default: {} })
  headers: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  body: unknown;

  @Column({ name: 'virtual_users', type: 'integer' })
  virtualUsers: number;

  @Column({ name: 'duration_seconds', type: 'integer' })
  durationSeconds: number;

  @Column({ name: 'ramp_up_seconds', type: 'integer', default: 0 })
  rampUpSeconds: number;

  @Column({ name: 'expected_response_time_ms', type: 'integer', nullable: true })
  expectedResponseTimeMs: number | null;

  @Column({ name: 'stop_conditions', type: 'jsonb', default: {} })
  stopConditions: StopConditions;

  @Column({
    type: 'enum',
    enum: LoadTestStatus,
    enumName: 'load_test_status',
    default: LoadTestStatus.DRAFT,
  })
  status: LoadTestStatus;

  @OneToMany(() => TestRunEntity, (run) => run.test)
  runs: TestRunEntity[];
}
