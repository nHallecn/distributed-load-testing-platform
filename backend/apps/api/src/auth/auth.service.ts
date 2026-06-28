import { UserEntity } from '@app/domain';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { LoginDto, RegisterDto } from './dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.exists({ where: { email } })) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = await this.users.save(
      this.users.create({
        email,
        passwordHash: await hash(dto.password, 12),
      }),
    );
    await this.audit.record({
      actorId: user.id,
      action: 'user.registered',
      resourceType: 'user',
      resourceId: user.id,
    });
    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({
      where: { email: dto.email.trim().toLowerCase(), isActive: true },
    });
    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    await this.audit.record({
      actorId: user.id,
      action: 'user.logged_in',
      resourceType: 'user',
      resourceId: user.id,
    });
    return this.issueToken(user);
  }

  private async issueToken(user: UserEntity) {
    const accessToken = await this.jwt.signAsync(
      { email: user.email, role: user.role },
      {
        subject: user.id,
        expiresIn: this.config.getOrThrow<string>('JWT_EXPIRES_IN') as never,
      },
    );
    return {
      accessToken,
      tokenType: 'Bearer',
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
