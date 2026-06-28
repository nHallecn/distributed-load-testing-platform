import * as Joi from 'joi';

export const environmentSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  API_PORT: Joi.number().port().default(5000),
  API_PREFIX: Joi.string().default('api/v1'),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  WORKER_QUEUE_NAME: Joi.string().default('load-test-jobs'),
  WORKER_CAPACITY: Joi.number().integer().min(1).default(500),
  MAX_VIRTUAL_USERS_PER_RUN: Joi.number().integer().min(1).default(10_000),
  MAX_TEST_DURATION_SECONDS: Joi.number().integer().min(1).default(3_600),
  TARGET_VERIFICATION_REQUIRED: Joi.boolean().truthy('true').falsy('false').default(true),
  TARGET_REQUEST_TIMEOUT_MS: Joi.number().integer().min(100).default(10_000),
  DATABASE_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
});

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

export enum LoadTestStatus {
  DRAFT = 'draft',
  READY = 'ready',
  ARCHIVED = 'archived',
}

export enum RunStatus {
  QUEUED = 'queued',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum VerificationMethod {
  DNS_TXT = 'dns_txt',
  HTTP_FILE = 'http_file',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

export const TERMINAL_RUN_STATUSES = new Set<RunStatus>([
  RunStatus.COMPLETED,
  RunStatus.FAILED,
  RunStatus.CANCELLED,
]);
