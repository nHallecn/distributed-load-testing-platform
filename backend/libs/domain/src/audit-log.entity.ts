import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'audit_logs' })
@Index(['actorId', 'createdAt'])
export class AuditLogEntity {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null;

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
