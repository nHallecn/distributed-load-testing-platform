export type UserRole = 'user' | 'admin';
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';
export type LoadTestStatus = 'draft' | 'ready' | 'archived';
export type RunStatus =
  | 'queued'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'completed'
  | 'failed'
  | 'cancelled';
export type VerificationMethod = 'dns_txt' | 'http_file';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  user: User;
}

export interface StopConditions {
  maxErrorRatePercent?: number;
  maxP95LatencyMs?: number;
}

export interface LoadTest {
  id: string;
  ownerId: string;
  targetVerificationId: string | null;
  name: string;
  targetUrl: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body: unknown;
  virtualUsers: number;
  durationSeconds: number;
  rampUpSeconds: number;
  expectedResponseTimeMs: number | null;
  stopConditions: StopConditions;
  status: LoadTestStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface TestRun {
  id: string;
  testId: string;
  requestedBy: string;
  status: RunStatus;
  desiredWorkers: number;
  startedAt: string | null;
  endedAt: string | null;
  stopReason: string | null;
  totalRequests: string;
  successfulRequests: string;
  failedRequests: string;
  averageLatencyMs: number | null;
  p95LatencyMs: number | null;
  p99LatencyMs: number | null;
  errorRatePercent: number | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  test?: LoadTest;
}

export interface MetricSnapshot {
  id: string;
  runId: string;
  workerId: string | null;
  recordedAt: string;
  requestsPerSecond: number;
  totalRequests: string;
  failedRequests: string;
  p95LatencyMs: number;
  latencySumMs: number;
  latencyBuckets: Record<string, number>;
  activeVirtualUsers: number;
  statusCodes: Record<string, number>;
}

export interface RunReport {
  runId: string;
  status: RunStatus;
  startedAt: string | null;
  endedAt: string | null;
  totalRequests: string;
  successfulRequests: string;
  failedRequests: string;
  averageLatencyMs: number | null;
  p95LatencyMs: number | null;
  p99LatencyMs: number | null;
  errorRatePercent: number | null;
  stopReason: string | null;
}

export interface VerificationInstructions {
  recordType?: 'TXT';
  name?: string;
  value?: string;
  url?: string;
  body?: string;
}

export interface TargetVerification {
  id: string;
  ownerId: string;
  hostname: string;
  method: VerificationMethod;
  token: string;
  status: 'pending' | 'verified' | 'expired' | 'failed';
  verifiedAt: string | null;
  expiresAt: string;
  lastError: string | null;
  instructions: VerificationInstructions;
}

export interface CreateLoadTestInput {
  name: string;
  targetUrl: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: unknown;
  virtualUsers: number;
  durationSeconds: number;
  rampUpSeconds: number;
  expectedResponseTimeMs?: number;
  stopConditions?: StopConditions;
}
