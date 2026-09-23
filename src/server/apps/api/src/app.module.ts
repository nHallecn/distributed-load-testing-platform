import { environmentSchema } from '@app/config';
import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoadTestsModule } from './load-tests/load-tests.module';
import { RunsModule } from './runs/runs.module';
import { TargetsModule } from './targets/targets.module';
import { AuditModule } from './audit/audit.module';
import { WorkspaceModule } from './workspace/workspace.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: environmentSchema,
    }),
    DatabaseModule,
    AuditModule,
    WorkspaceModule,
    TargetsModule,
    LoadTestsModule,
    RunsModule,
  ],
})
export class AppModule {}
