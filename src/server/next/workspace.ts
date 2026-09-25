import 'server-only';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'loadgrid_workspace';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const requestKeys = new WeakMap<Request, string>();

function secret(): string {
  return (
    process.env.ANONYMOUS_WORKSPACE_SECRET ??
    'loadgrid-local-development-secret-change-me'
  );
}

function signature(id: string): string {
  return createHmac('sha256', secret()).update(id).digest('base64url');
}

function parseCookie(request: Request): string | undefined {
  const cookies = request.headers.get('cookie') ?? '';
  const encoded = cookies
    .split(';')
    .map((part) => part.trim().split('='))
    .find(([name]) => name === COOKIE_NAME)?.[1];
  if (!encoded) return undefined;

  const [id, provided] = decodeURIComponent(encoded).split('.');
  if (!id || !provided || !/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const expected = signature(id);
  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  if (
    expectedBytes.length !== providedBytes.length ||
    !timingSafeEqual(expectedBytes, providedBytes)
  ) {
    return undefined;
  }
  return id;
}

export function workspaceKey(request: Request): string {
  const existing = requestKeys.get(request);
  if (existing) return existing;
  const key = parseCookie(request) ?? randomUUID();
  requestKeys.set(request, key);
  return key;
}

export function attachWorkspaceCookie(
  response: Response,
  request: Request,
): Response {
  if (parseCookie(request)) return response;
  const id = workspaceKey(request);
  const value = encodeURIComponent(`${id}.${signature(id)}`);
  response.headers.append(
    'Set-Cookie',
    `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  );
  return response;
}
