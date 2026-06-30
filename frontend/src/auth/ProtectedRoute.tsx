import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from './useAuth';
import { Logo } from '../components/brand/Logo';

export function ProtectedRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-950">
        <div className="flex flex-col items-center gap-5 text-slate-400">
          <Logo />
          <LoaderCircle className="size-5 animate-spin text-signal-400" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
