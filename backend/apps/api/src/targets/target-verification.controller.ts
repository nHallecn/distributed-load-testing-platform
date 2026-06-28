import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '@app/config';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTargetVerificationDto } from './dto';
import { TargetVerificationService } from './target-verification.service';

@ApiTags('target verification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('targets/verifications')
export class TargetVerificationController {
  constructor(private readonly service: TargetVerificationService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTargetVerificationDto,
  ) {
    return this.service.create(user.id, dto);
  }

  @Post(':id/verify')
  verify(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.verify(user.id, id);
  }
}
