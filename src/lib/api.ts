import type {
  CreateLoadTestInput,
  LoadTest,
  MetricSnapshot,
  RunReport,
  TargetVerification,
  TestRun,
  VerificationMethod,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1';

interface ApiErrorPayload {
  message?: string | string[];
  error?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      'The API is unreachable. Check that the application is running.',
    );
  }

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => ({}))) as ApiErrorPayload;
    const message = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : (payload.message ?? payload.error ?? `Request failed (${response.status})`);
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  listTests: () => request<LoadTest[]>('/tests'),
  getTest: (id: string) => request<LoadTest>(`/tests/${id}`),
  createTest: (input: CreateLoadTestInput) =>
    request<LoadTest>('/tests', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  createVerification: (targetUrl: string, method: VerificationMethod) =>
    request<TargetVerification>('/targets/verifications', {
      method: 'POST',
      body: JSON.stringify({ targetUrl, method }),
    }),
  verifyTarget: (id: string) =>
    request<TargetVerification>(`/targets/verifications/${id}/verify`, {
      method: 'POST',
    }),

  startRun: (testId: string) =>
    request<TestRun>(`/tests/${testId}/runs`, { method: 'POST' }),
  getRun: (id: string) => request<TestRun>(`/runs/${id}`),
  stopRun: (id: string) =>
    request<TestRun>(`/runs/${id}/stop`, { method: 'POST' }),
  getRunMetrics: (id: string) =>
    request<MetricSnapshot[]>(`/runs/${id}/metrics`),
  getRunReport: (id: string) => request<RunReport>(`/runs/${id}/report`),
};
