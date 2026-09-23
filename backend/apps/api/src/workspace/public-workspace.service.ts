import { UserRole } from '@app/config';
import { UserEntity } from '@app/domain';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export const PUBLIC_WORKSPACE_EMAIL = 'public-workspace@loadgrid.local';

@Injectable()
export class PublicWorkspaceService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async ownerId(): Promise<string> {
    await this.users.upsert(
      {
        email: PUBLIC_WORKSPACE_EMAIL,
        passwordHash: 'login-disabled-for-public-workspace',
        role: UserRole.USER,
        isActive: true,
      },
      ['email'],
    );

    const workspace = await this.users.findOneByOrFail({
      email: PUBLIC_WORKSPACE_EMAIL,
    });
    return workspace.id;
  }
}
