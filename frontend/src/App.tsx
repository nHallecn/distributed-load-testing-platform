import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppShell } from './layouts/AppShell';

const DashboardPage = lazy(() =>
  import('./pages/dashboard/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);
const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import('./pages/auth/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  })),
);
const TestsPage = lazy(() =>
  import('./pages/tests/TestsPage').then((module) => ({
    default: module.TestsPage,
  })),
);
const NewTestPage = lazy(() =>
  import('./pages/tests/NewTestPage').then((module) => ({
    default: module.NewTestPage,
  })),
);
const TestDetailPage = lazy(() =>
  import('./pages/tests/TestDetailPage').then((module) => ({
    default: module.TestDetailPage,
  })),
);
const TargetsPage = lazy(() =>
  import('./pages/targets/TargetsPage').then((module) => ({
    default: module.TargetsPage,
  })),
);
const RunPage = lazy(() =>
  import('./pages/runs/RunPage').then((module) => ({
    default: module.RunPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
);

export function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="tests" element={<TestsPage />} />
            <Route path="tests/new" element={<NewTestPage />} />
            <Route path="tests/:id" element={<TestDetailPage />} />
            <Route path="targets" element={<TargetsPage />} />
            <Route path="runs/:id" element={<RunPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

function RouteLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-950">
      <span className="signal-pulse size-3 rounded-full bg-signal-400" />
    </div>
  );
}
