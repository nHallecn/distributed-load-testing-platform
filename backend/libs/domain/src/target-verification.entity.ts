import {
  VerificationMethod,
  VerificationStatus,
} from '@app/config';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'target_verifications' })
@Index(['ownerId', 'hostname'])
export class TargetVerificationEntity extends BaseEntity {
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => UserEntity, (user) => user.targetVerifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @Column({ length: 253 })
  hostname: string;

  @Column({
    type: 'enum',
    enum: VerificationMethod,
    enumName: 'verification_method',
  })
  method: VerificationMethod;

  @Index({ unique: true })
  @Column({ length: 100 })
  token: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    enumName: 'verification_status',
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string | null;
}
