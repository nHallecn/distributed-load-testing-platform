import { UserRole } from '@app/config';
import { UserEntity } from '@app/domain';
import { Repository } from 'typeorm';
import {
  PUBLIC_WORKSPACE_EMAIL,
  PublicWorkspaceService,
} from './public-workspace.service';

describe('PublicWorkspaceService', () => {
  it('creates or reuses the internal public owner', async () => {
    const upsert = jest.fn().mockResolvedValue(undefined);
    const findOneBy = jest.fn().mockResolvedValue(null);
    const findOneByOrFail = jest
      .fn()
      .mockResolvedValue({ id: 'workspace-id' });
    const repository = {
      upsert,
      findOneBy,
      findOneByOrFail,
    } as unknown as Repository<UserEntity>;
    const service = new PublicWorkspaceService(repository);

    await expect(service.ownerId()).resolves.toBe('workspace-id');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: PUBLIC_WORKSPACE_EMAIL,
        role: UserRole.USER,
        isActive: true,
      }),
      ['email'],
    );
  });

  it('reuses an active workspace without writing', async () => {
    const upsert = jest.fn();
    const repository = {
      upsert,
      findOneBy: jest.fn().mockResolvedValue({ id: 'existing-workspace' }),
    } as unknown as Repository<UserEntity>;
    const service = new PublicWorkspaceService(repository);

    await expect(service.ownerId()).resolves.toBe('existing-workspace');
    expect(upsert).not.toHaveBeenCalled();
  });
});
