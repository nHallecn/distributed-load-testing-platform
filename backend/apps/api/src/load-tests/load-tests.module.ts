import { LoadTestEntity } from '@app/domain';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetsModule } from '../targets/targets.module';
import { LoadTestsController } from './load-tests.controller';
import { LoadTestsService } from './load-tests.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoadTestEntity]), TargetsModule],
  controllers: [LoadTestsController],
  providers: [LoadTestsService],
  exports: [LoadTestsService],
})
export class LoadTestsModule {}
