import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'audit_logs' })
@Index('idx_audit_logs_actor_created', ['actorId', 'createdAt'])
export class AuditLogEntity {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'actor_id',
    foreignKeyConstraintName: 'audit_logs_actor_id_fkey',
  })
  actor: UserEntity | null;

  @Column({ length: 100 })
  action: string;

  @Column({ name: 'resource_type', length: 100 })
  resourceType: string;

  @Column({ name: 'resource_id', type: 'uuid', nullable: true })
  resourceId: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
