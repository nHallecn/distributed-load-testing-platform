import {
  MetricSnapshotEntity,
  TestRunEntity,
} from '@app/domain';
import { QueueModule } from '@app/queue';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoadTestsModule } from '../load-tests/load-tests.module';
import { RunStateService } from './run-state.service';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';
import { TargetsModule } from '../targets/targets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestRunEntity, MetricSnapshotEntity]),
    LoadTestsModule,
    TargetsModule,
    QueueModule,
  ],
  controllers: [RunsController],
  providers: [RunsService, RunStateService],
})
export class RunsModule {}
