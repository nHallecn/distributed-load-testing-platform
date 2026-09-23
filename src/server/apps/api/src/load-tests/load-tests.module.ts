import { LoadTestEntity } from '@app/domain';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetsModule } from '../targets/targets.module';
import { LoadTestsService } from './load-tests.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoadTestEntity]), TargetsModule],
  providers: [LoadTestsService],
  exports: [LoadTestsService],
})
export class LoadTestsModule {}
