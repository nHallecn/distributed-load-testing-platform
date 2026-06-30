import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { api } from '../lib/api';
import { clearAccessToken, getAccessToken, setAccessToken } from '../lib/token-store';
import type { User } from '../lib/types';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(() =>
    Boolean(getAccessToken()),
  );

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('loadgrid:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('loadgrid:unauthorized', handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    if (!getAccessToken()) {
      return;
    }
    void api
      .me()
      .then(setUser)
      .catch(logout)
      .finally(() => setInitializing(false));
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    setAccessToken(response.accessToken);
    setUser(response.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const response = await api.register(email, password);
    setAccessToken(response.accessToken);
    setUser(response.user);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout }),
    [initializing, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
