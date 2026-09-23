import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicWorkspaceService } from '../workspace/public-workspace.service';
import { CreateTargetVerificationDto } from './dto';
import { TargetVerificationService } from './target-verification.service';

@ApiTags('target verification')
@Controller('targets/verifications')
export class TargetVerificationController {
  constructor(
    private readonly service: TargetVerificationService,
    private readonly workspace: PublicWorkspaceService,
  ) {}

  @Post()
  async create(@Body() dto: CreateTargetVerificationDto) {
    return this.service.create(await this.workspace.ownerId(), dto);
  }

  @Post(':id/verify')
  async verify(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.verify(await this.workspace.ownerId(), id);
  }
}
