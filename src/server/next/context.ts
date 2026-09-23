import 'server-only';
import 'reflect-metadata';
import type { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

declare global {
  var loadGridServerContext: Promise<INestApplicationContext> | undefined;
}

export function getServerContext(): Promise<INestApplicationContext> {
  globalThis.loadGridServerContext ??= createServerContext();
  return globalThis.loadGridServerContext;
}

async function createServerContext(): Promise<INestApplicationContext> {
  const { AppModule } = await import('@/server/apps/api/src/app.module');
  return NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
}
