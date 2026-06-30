import {
  FlaskConical,
  Gauge,
  LogOut,
  Menu,
  PanelLeftClose,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { Logo } from '../components/brand/Logo';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/ui/Button';

const navigation = [
  { label: 'Overview', to: '/app', icon: Gauge, end: true },
  { label: 'Load tests', to: '/app/tests', icon: FlaskConical },
  { label: 'Target access', to: '/app/targets', icon: ShieldCheck },
];

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen">
      {mobileOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-ink-950/45 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col bg-ink-950 text-white transition-transform duration-200 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="grid-lines absolute inset-0 opacity-25" />
        <div className="relative flex h-[76px] items-center justify-between border-b border-white/[0.07] px-6">
          <Logo compact />
          <button
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden"
            onClick={closeMobile}
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="relative flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-slate-600">
            Control plane
          </p>
          <div className="space-y-1.5">
            {navigation.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={closeMobile}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold',
                    isActive
                      ? 'bg-white/[0.09] text-white'
                      : 'text-slate-400 hover:bg-white/[0.045] hover:text-slate-200',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={clsx(
                        'grid size-8 place-items-center rounded-lg',
                        isActive
                          ? 'bg-signal-400 text-ink-950'
                          : 'bg-white/[0.04] text-slate-500 group-hover:text-slate-300',
                      )}
                    >
                      <Icon className="size-4" strokeWidth={2.2} />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="relative m-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
          <p className="text-xs font-bold text-white">Safety is active</p>
          <p className="mt-1.5 text-[0.7rem] leading-5 text-slate-500">
            Private networks and unverified targets are blocked.
          </p>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-[#f4f6fa]/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation"
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </button>
            <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">
              <PanelLeftClose className="size-4" />
              <span>
                {location.pathname.includes('/runs/')
                  ? 'Run monitor'
                  : 'Workspace'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-52 truncate text-xs font-bold text-slate-700">
                {user?.email}
              </p>
              <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
                {user?.role}
              </p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-ink-900 text-xs font-extrabold uppercase text-signal-400">
              {user?.email.slice(0, 2)}
            </span>
            <Button
              variant="ghost"
              className="!size-9 !min-h-9 !p-0"
              aria-label="Sign out"
              onClick={logout}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
