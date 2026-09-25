import { UserRole } from '@app/config';
import { UserEntity } from '@app/domain';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'node:crypto';

export const PUBLIC_WORKSPACE_EMAIL = 'public-workspace@loadgrid.local';

export function workspaceEmail(key?: string): string {
  if (!key) return PUBLIC_WORKSPACE_EMAIL;
  const digest = createHash('sha256').update(key).digest('hex').slice(0, 32);
  return `anonymous-${digest}@loadgrid.local`;
}

@Injectable()
export class PublicWorkspaceService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async ownerId(workspaceKey?: string): Promise<string> {
    const email = workspaceEmail(workspaceKey);
    const existing = await this.users.findOneBy({
      email,
      isActive: true,
    });
    if (existing) return existing.id;

    await this.users.upsert(
      {
        email,
        passwordHash: 'login-disabled-for-public-workspace',
        role: UserRole.USER,
        isActive: true,
      },
      ['email'],
    );

    const workspace = await this.users.findOneByOrFail({
      email,
    });
    return workspace.id;
  }
}
