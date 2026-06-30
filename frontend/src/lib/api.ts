import { clearAccessToken, getAccessToken } from './token-store';
import type {
  AuthResponse,
  CreateLoadTestInput,
  LoadTest,
  MetricSnapshot,
  RunReport,
  TargetVerification,
  TestRun,
  User,
  VerificationMethod,
} from './types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

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
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      'The API is unreachable. Check that the backend is running.',
    );
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearAccessToken();
      window.dispatchEvent(new Event('loadgrid:unauthorized'));
    }
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
  register: (email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>('/auth/me'),

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
