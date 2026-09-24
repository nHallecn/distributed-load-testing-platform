import {
  VerificationMethod,
  VerificationStatus,
} from '@app/config';
import { TargetVerificationEntity } from '@app/domain';
import { UrlPolicyService } from '@app/safety';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { resolveTxt } from 'node:dns/promises';
import { MoreThan, Repository } from 'typeorm';
import { CreateTargetVerificationDto } from './dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TargetVerificationService {
  constructor(
    @InjectRepository(TargetVerificationEntity)
    private readonly verifications: Repository<TargetVerificationEntity>,
    private readonly urlPolicy: UrlPolicyService,
    private readonly audit: AuditService,
  ) {}

  async create(ownerId: string, dto: CreateTargetVerificationDto) {
    const target = await this.urlPolicy.assertPublicHttpUrl(dto.targetUrl);
    const hostname = target.hostname.toLowerCase();
    const verification = await this.verifications.save(
      this.verifications.create({
        ownerId,
        hostname,
        method: dto.method,
        token: randomBytes(32).toString('hex'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }),
    );
    await this.audit.record({
      actorId: ownerId,
      action: 'target.verification_created',
      resourceType: 'target_verification',
      resourceId: verification.id,
      metadata: { hostname, method: dto.method },
    });

    return {
      ...verification,
      instructions:
        dto.method === VerificationMethod.DNS_TXT
          ? {
              recordType: 'TXT',
              name: `_loadtest-verification.${hostname}`,
              value: `loadtest-verification=${verification.token}`,
            }
          : {
              url: `https://${hostname}/.well-known/loadtest-verification.txt`,
              body: `loadtest-verification=${verification.token}`,
            },
    };
  }

  async verify(ownerId: string, id: string) {
    const verification = await this.findOwned(ownerId, id);
    if (verification.expiresAt.getTime() <= Date.now()) {
      verification.status = VerificationStatus.EXPIRED;
      await this.verifications.save(verification);
      throw new BadRequestException('This verification challenge has expired');
    }

    try {
      const valid =
        verification.method === VerificationMethod.DNS_TXT
          ? await this.verifyDns(verification)
          : await this.verifyHttp(verification);
      if (!valid) {
        throw new Error('The expected verification token was not found');
      }
      verification.status = VerificationStatus.VERIFIED;
      verification.verifiedAt = new Date();
      verification.lastError = null;
    } catch (error) {
      verification.status = VerificationStatus.FAILED;
      verification.lastError =
        error instanceof Error ? error.message : 'Verification failed';
    }

    const saved = await this.verifications.save(verification);
    if (saved.status !== VerificationStatus.VERIFIED) {
      throw new BadRequestException(saved.lastError);
    }
    await this.audit.record({
      actorId: ownerId,
      action: 'target.verified',
      resourceType: 'target_verification',
      resourceId: saved.id,
      metadata: { hostname: saved.hostname, method: saved.method },
    });
    return saved;
  }

  async findVerifiedForTarget(ownerId: string, rawUrl: string) {
    const url = await this.urlPolicy.assertPublicHttpUrl(rawUrl);
    return this.verifications.findOne({
      where: {
        ownerId,
        hostname: url.hostname.toLowerCase(),
        status: VerificationStatus.VERIFIED,
        expiresAt: MoreThan(new Date()),
      },
      order: { verifiedAt: 'DESC' },
    });
  }

  private async findOwned(ownerId: string, id: string) {
    const verification = await this.verifications.findOne({
      where: { id, ownerId },
    });
    if (!verification) {
      throw new NotFoundException('Target verification was not found');
    }
    return verification;
  }

  private async verifyDns(verification: TargetVerificationEntity) {
    const records = await resolveTxt(
      `_loadtest-verification.${verification.hostname}`,
    );
    const expected = `loadtest-verification=${verification.token}`;
    return records.some((chunks) => chunks.join('') === expected);
  }

  private async verifyHttp(verification: TargetVerificationEntity) {
    const url = `https://${verification.hostname}/.well-known/loadtest-verification.txt`;
    await this.urlPolicy.assertPublicHttpUrl(url);
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5_000),
      redirect: 'error',
      headers: { 'user-agent': 'distributed-load-testing-verifier/0.1' },
    });
    if (!response.ok) {
      return false;
    }
    const body = (await response.text()).trim();
    return body === `loadtest-verification=${verification.token}`;
  }
}
