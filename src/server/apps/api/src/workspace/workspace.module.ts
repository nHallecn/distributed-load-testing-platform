import { UserEntity } from '@app/domain';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicWorkspaceService } from './public-workspace.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [PublicWorkspaceService],
  exports: [PublicWorkspaceService],
})
export class WorkspaceModule {}
