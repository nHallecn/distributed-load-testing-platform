import { Controller, Get, Header } from '@nestjs/common';
import {
  collectDefaultMetrics,
  register,
} from 'prom-client';

let metricsInitialized = false;

@Controller('metrics')
export class MetricsController {
  constructor() {
    if (!metricsInitialized) {
      collectDefaultMetrics({ prefix: 'loadtest_api_' });
      metricsInitialized = true;
    }
  }

  @Get()
  @Header('Content-Type', register.contentType)
  getMetrics() {
    return register.metrics();
  }
}
