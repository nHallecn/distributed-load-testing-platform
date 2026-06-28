import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '@app/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { RunsService } from './runs.service';

@ApiTags('test runs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class RunsController {
  constructor(private readonly service: RunsService) {}

  @Post('tests/:testId/runs')
  start(
    @CurrentUser() user: AuthenticatedUser,
    @Param('testId', ParseUUIDPipe) testId: string,
  ) {
    return this.service.start(user.id, testId);
  }

  @Post('runs/:id/stop')
  @HttpCode(HttpStatus.ACCEPTED)
  stop(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.stop(user.id, id);
  }

  @Get('runs/:id')
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getOwned(user.id, id);
  }

  @Get('runs/:id/metrics')
  metrics(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getMetrics(user.id, id);
  }

  @Get('runs/:id/report')
  report(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getReport(user.id, id);
  }
}
