import { VerificationMethod } from '@app/config';
import { IsEnum, IsUrl } from 'class-validator';

export class CreateTargetVerificationDto {
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  targetUrl: string;

  @IsEnum(VerificationMethod)
  method: VerificationMethod;
}
