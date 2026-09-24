import { LoadTestStatus } from '@app/config';
import { LoadTestEntity } from '@app/domain';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TargetVerificationService } from '../targets/target-verification.service';
import { CreateLoadTestDto } from './dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class LoadTestsService {
  constructor(
    @InjectRepository(LoadTestEntity)
    private readonly tests: Repository<LoadTestEntity>,
    private readonly targets: TargetVerificationService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async create(ownerId: string, dto: CreateLoadTestDto) {
    this.assertLimits(dto);
    this.assertHeaders(dto.headers);
    const verification = await this.targets.findVerifiedForTarget(
      ownerId,
      dto.targetUrl,
    );
    const verificationRequired = this.config.get<boolean>(
      'TARGET_VERIFICATION_REQUIRED',
      true,
    );
    if (verificationRequired && !verification) {
      throw new BadRequestException(
        'Verify ownership of the target before creating a runnable test',
      );
    }

    const test = await this.tests.save(
      this.tests.create({
        ...dto,
        name: dto.name.trim(),
        targetVerificationId: verification?.id ?? null,
        expectedResponseTimeMs: dto.expectedResponseTimeMs ?? null,
        body: dto.body ?? null,
        ownerId,
        status: LoadTestStatus.READY,
      }),
    );
    await this.audit.record({
      actorId: ownerId,
      action: 'load_test.created',
      resourceType: 'load_test',
      resourceId: test.id,
      metadata: {
        hostname: new URL(test.targetUrl).hostname,
        virtualUsers: test.virtualUsers,
        durationSeconds: test.durationSeconds,
      },
    });
    return test;
  }

  list(ownerId: string) {
    return this.tests.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getOwned(ownerId: string, id: string) {
    const test = await this.tests.findOne({ where: { id, ownerId } });
    if (!test) {
      throw new NotFoundException('Load test was not found');
    }
    return test;
  }

  private assertLimits(dto: CreateLoadTestDto) {
    const maxUsers = this.config.get<number>('MAX_VIRTUAL_USERS_PER_RUN', 10_000);
    const maxDuration = this.config.get<number>(
      'MAX_TEST_DURATION_SECONDS',
      3_600,
    );
    if (dto.virtualUsers > maxUsers) {
      throw new BadRequestException(
        `virtualUsers cannot exceed the configured limit of ${maxUsers}`,
      );
    }
    if (dto.durationSeconds > maxDuration) {
      throw new BadRequestException(
        `durationSeconds cannot exceed the configured limit of ${maxDuration}`,
      );
    }
    if (dto.rampUpSeconds > dto.durationSeconds) {
      throw new BadRequestException(
        'rampUpSeconds cannot exceed durationSeconds',
      );
    }
  }

  private assertHeaders(headers: Record<string, string>) {
    const blocked = new Set([
      'connection',
      'content-length',
      'host',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailer',
      'transfer-encoding',
      'upgrade',
    ]);
    const entries = Object.entries(headers);
    if (entries.length > 50) {
      throw new BadRequestException('No more than 50 request headers are allowed');
    }
    for (const [name, value] of entries) {
      if (
        !/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name) ||
        typeof value !== 'string' ||
        value.length > 8_192
      ) {
        throw new BadRequestException(`Invalid request header: ${name}`);
      }
      if (blocked.has(name.toLowerCase())) {
        throw new BadRequestException(`Request header is not allowed: ${name}`);
      }
    }
  }
}
