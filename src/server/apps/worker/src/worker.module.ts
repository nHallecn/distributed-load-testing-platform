import { environmentSchema } from '@app/config';
import { DatabaseModule } from '@app/database';
import {
  MetricSnapshotEntity,
  TestRunEntity,
  WorkerEntity,
} from '@app/domain';
import { UrlPolicyService } from '@app/safety';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoadGeneratorService } from './load-generator.service';
import { WorkerConsumerService } from './worker-consumer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: environmentSchema,
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([
      TestRunEntity,
      WorkerEntity,
      MetricSnapshotEntity,
    ]),
  ],
  providers: [
    UrlPolicyService,
    LoadGeneratorService,
    WorkerConsumerService,
  ],
})
export class WorkerModule {}
