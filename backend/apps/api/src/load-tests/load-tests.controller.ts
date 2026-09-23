import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicWorkspaceService } from '../workspace/public-workspace.service';
import { CreateLoadTestDto } from './dto';
import { LoadTestsService } from './load-tests.service';

@ApiTags('load tests')
@Controller('tests')
export class LoadTestsController {
  constructor(
    private readonly service: LoadTestsService,
    private readonly workspace: PublicWorkspaceService,
  ) {}

  @Post()
  async create(@Body() dto: CreateLoadTestDto) {
    return this.service.create(await this.workspace.ownerId(), dto);
  }

  @Get()
  async list() {
    return this.service.list(await this.workspace.ownerId());
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getOwned(await this.workspace.ownerId(), id);
  }
}
