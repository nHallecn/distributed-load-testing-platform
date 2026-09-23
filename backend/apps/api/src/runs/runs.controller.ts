import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicWorkspaceService } from '../workspace/public-workspace.service';
import { RunsService } from './runs.service';

@ApiTags('test runs')
@Controller()
export class RunsController {
  constructor(
    private readonly service: RunsService,
    private readonly workspace: PublicWorkspaceService,
  ) {}

  @Post('tests/:testId/runs')
  async start(@Param('testId', ParseUUIDPipe) testId: string) {
    return this.service.start(await this.workspace.ownerId(), testId);
  }

  @Post('runs/:id/stop')
  @HttpCode(HttpStatus.ACCEPTED)
  async stop(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.stop(await this.workspace.ownerId(), id);
  }

  @Get('runs/:id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getOwned(await this.workspace.ownerId(), id);
  }

  @Get('runs/:id/metrics')
  async metrics(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getMetrics(await this.workspace.ownerId(), id);
  }

  @Get('runs/:id/report')
  async report(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getReport(await this.workspace.ownerId(), id);
  }
}
