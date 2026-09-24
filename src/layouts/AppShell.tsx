'use client';

import {
  FlaskConical,
  Gauge,
  Menu,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type PropsWithChildren } from 'react';
import { Logo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/ButtonLink';

const navigation = [
  { label: 'Overview', to: '/app', icon: Gauge, end: true },
  { label: 'Load tests', to: '/app/tests', icon: FlaskConical },
  { label: 'Target access', to: '/app/targets', icon: ShieldCheck },
];

export function AppShell({ children }: PropsWithChildren) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f5f7f5]/88 backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] max-w-[1460px] items-center justify-between px-4 sm:px-7 lg:px-10">
          <div className="flex items-center gap-9">
            <Link href="/" aria-label="LoadGrid home">
              <Logo compact darkText />
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-sm lg:flex">
              {navigation.map(({ label, to, end }) => {
                const active = end ? pathname === to : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    href={to}
                    className={clsx(
                      'rounded-full px-4 py-2 text-xs font-bold',
                      active
                        ? 'bg-ink-950 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-ink-950',
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:flex">
              <span className="signal-pulse size-1.5 rounded-full bg-signal-500" />
              Public workspace
            </span>
            <ButtonLink
              to="/app/tests/new"
              className="!min-h-10 !rounded-full !px-4 text-xs shadow-[0_10px_24px_rgba(21,184,138,0.14)]"
              icon={<Plus className="size-3.5" />}
            >
              New test
            </ButtonLink>
            <button
              type="button"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
              className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="workspace-menu border-t border-slate-200/80 bg-white px-4 py-4 shadow-xl lg:hidden">
            <nav className="mx-auto grid max-w-[720px] gap-2 sm:grid-cols-3">
              {navigation.map(({ label, to, icon: Icon, end }) => {
                const active = end ? pathname === to : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    href={to}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold',
                      active ? 'bg-ink-950 text-white' : 'bg-slate-50 text-slate-600',
                    )}
                  >
                    <Icon className={clsx('size-4', active && 'text-signal-400')} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
      </header>

      <div className="relative">
        <div className="workspace-backdrop pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
        <main className="relative mx-auto max-w-[1460px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
          <div className="mb-7 flex items-center gap-2 text-[0.66rem] font-extrabold uppercase tracking-[0.14em] text-slate-400 lg:hidden">
            <Sparkles className="size-3.5 text-violet-500" />
            {pathname.includes('/runs/') ? 'Live run monitor' : 'LoadGrid workspace'}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
