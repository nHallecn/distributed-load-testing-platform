const TOKEN_KEY = 'loadgrid.access_token';

let inMemoryToken: string | null = null;

export function getAccessToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  inMemoryToken = sessionStorage.getItem(TOKEN_KEY);
  return inMemoryToken;
}

export function setAccessToken(token: string): void {
  inMemoryToken = token;
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  inMemoryToken = null;
  sessionStorage.removeItem(TOKEN_KEY);
}
