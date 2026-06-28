import { UserRole } from '@app/config';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { LoadTestEntity } from './load-test.entity';
import { TargetVerificationEntity } from './target-verification.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ length: 320 })
  email: string;

  @Column({ name: 'password_hash', length: 100 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role',
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => LoadTestEntity, (test) => test.owner)
  tests: LoadTestEntity[];

  @OneToMany(() => TargetVerificationEntity, (verification) => verification.owner)
  targetVerifications: TargetVerificationEntity[];
}
