import 'server-only';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  type Type,
} from '@nestjs/common';
import { attachWorkspaceCookie } from './workspace';

interface RateLimitEntry {
  count: number;
  resetsAt: number;
}

declare global {
  var loadGridRateLimits: Map<string, RateLimitEntry> | undefined;
}

const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60_000;

export async function apiResponse(
  request: Request,
  action: () => Promise<unknown>,
  successStatus = 200,
): Promise<Response> {
  try {
    enforceRateLimit(request);
    const result = await action();
    return attachWorkspaceCookie(
      Response.json(result, { status: successStatus }),
      request,
    );
  } catch (error) {
    const exception =
      error instanceof HttpException
        ? error
        : new InternalServerErrorException('Unexpected server error');
    if (!(error instanceof HttpException)) console.error(error);
    const response = exception.getResponse();
    const payload =
      typeof response === 'string'
        ? { statusCode: exception.getStatus(), message: response }
        : response;
    return attachWorkspaceCookie(
      Response.json(payload, { status: exception.getStatus() }),
      request,
    );
  }
}

function enforceRateLimit(request: Request): void {
  const now = Date.now();
  const forwardedFor = request.headers.get('x-forwarded-for');
  const client =
    forwardedFor?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'direct';
  const limits = (globalThis.loadGridRateLimits ??= new Map());
  const current = limits.get(client);

  if (!current || current.resetsAt <= now) {
    limits.set(client, { count: 1, resetsAt: now + RATE_WINDOW_MS });
    return;
  }

  if (current.count >= RATE_LIMIT) {
    throw new HttpException('Too many requests; try again shortly', 429);
  }

  current.count += 1;
}

export async function validatedBody<T extends object>(
  request: Request,
  dto: Type<T>,
): Promise<T> {
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > 65_536) {
    throw new BadRequestException('Request body cannot exceed 64 KB');
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new BadRequestException('Request body must be valid JSON');
  }

  const instance = plainToInstance(dto, body, {
    enableImplicitConversion: false,
  });
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (errors.length) {
    const messages = errors.flatMap((error) =>
      Object.values(error.constraints ?? {}),
    );
    throw new BadRequestException(messages);
  }
  return instance;
}

export function uuid(value: string): string {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new BadRequestException('A valid UUID is required');
  }
  return value;
}
