import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly config: ConfigService,
  ) {}

  @Get('live')
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    const maxHeapBytes =
      this.config.get<number>('HEALTH_MAX_HEAP_MB', 1_024) * 1024 * 1024;
    return this.health.check([
      () => this.database.pingCheck('database', { timeout: 2_000 }),
      () => this.memory.checkHeap('memory_heap', maxHeapBytes),
    ]);
  }
}
