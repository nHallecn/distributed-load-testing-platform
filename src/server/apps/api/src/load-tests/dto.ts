import { HttpMethod } from '@app/config';
import { StopConditions } from '@app/domain';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class StopConditionsDto implements StopConditions {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  maxErrorRatePercent?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxP95LatencyMs?: number;
}

export class CreateLoadTestDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  targetUrl: string;

  @IsEnum(HttpMethod)
  method: HttpMethod;

  @IsOptional()
  @IsObject()
  headers: Record<string, string> = {};

  @IsOptional()
  body?: unknown;

  @IsInt()
  @Min(1)
  virtualUsers: number;

  @IsInt()
  @Min(1)
  durationSeconds: number;

  @IsInt()
  @Min(0)
  rampUpSeconds: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  expectedResponseTimeMs?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => StopConditionsDto)
  stopConditions: StopConditionsDto = {};
}
