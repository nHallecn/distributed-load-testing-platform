import { TargetVerificationEntity } from '@app/domain';
import { UrlPolicyService } from '@app/safety';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetVerificationController } from './target-verification.controller';
import { TargetVerificationService } from './target-verification.service';

@Module({
  imports: [TypeOrmModule.forFeature([TargetVerificationEntity])],
  controllers: [TargetVerificationController],
  providers: [TargetVerificationService, UrlPolicyService],
  exports: [TargetVerificationService, UrlPolicyService],
})
export class TargetsModule {}
