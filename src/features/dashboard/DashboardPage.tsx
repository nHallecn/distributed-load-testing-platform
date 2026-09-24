'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FlaskConical,
  Gauge,
  Plus,
  Radio,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCompactNumber, formatDate } from '@/lib/format';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function DashboardPage() {
  const tests = useQuery({ queryKey: ['tests'], queryFn: api.listTests });
  const items = tests.data ?? [];
  const ready = items.filter((test) => test.status === 'ready').length;
  const plannedUsers = items.reduce((total, test) => total + test.virtualUsers, 0);
  const workers = items.reduce(
    (total, test) => total + Math.ceil(test.virtualUsers / 500),
    0,
  );

  return (
    <>
      <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-violet-600">
            <Sparkles className="size-3.5" />
            Performance workspace
          </div>
          <h1 className="text-3xl font-[830] tracking-[-0.055em] text-ink-950 sm:text-5xl">
            See the pressure.<br className="hidden sm:block" /> Find the limit.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Configure distributed traffic, watch the system respond, and leave every run with a clear answer.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            to="/app/targets"
            variant="secondary"
            className="!min-h-12 !rounded-full !px-5"
            icon={<ShieldCheck className="size-4" />}
          >
            Verify target
          </ButtonLink>
          <ButtonLink
            to="/app/tests/new"
            className="!min-h-12 !rounded-full !px-5"
            icon={<Plus className="size-4" />}
          >
            Create load test
          </ButtonLink>
        </div>
      </section>

      {tests.isError ? (
        <div className="mb-6"><ErrorNotice message={tests.error.message} /></div>
      ) : null}

      <LiveLoadVisual />

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Test profiles',
            value: tests.isLoading ? '—' : items.length.toString(),
            note: tests.isLoading ? 'loading profiles' : `${ready} ready to run`,
            icon: FlaskConical,
            tone: 'bg-violet-100 text-violet-700',
          },
          {
            label: 'Planned capacity',
            value: tests.isLoading ? '—' : formatCompactNumber(plannedUsers),
            note: 'virtual users',
            icon: Gauge,
            tone: 'bg-emerald-100 text-emerald-700',
          },
          {
            label: 'Worker demand',
            value: tests.isLoading ? '—' : workers.toString(),
            note: 'at 500 users each',
            icon: ServerCog,
            tone: 'bg-sky-100 text-sky-700',
          },
          {
            label: 'Safety layer',
            value: 'Active',
            note: 'ownership required',
            icon: ShieldCheck,
            tone: 'bg-amber-100 text-amber-700',
          },
        ].map(({ label, value, note, icon: Icon, tone }) => (
          <article className="rounded-[1.4rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_14px_45px_rgba(15,23,42,0.045)]" key={label}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">{label}</p>
              <span className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon className="size-4" /></span>
            </div>
            <div className="mt-5 flex items-end justify-between gap-3">
              <p className="text-3xl font-[800] tracking-[-0.05em] text-ink-950">{value}</p>
              <p className="pb-1 text-[0.68rem] text-slate-400">{note}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.68fr)]">
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-lg font-[780] tracking-[-0.03em] text-ink-950">Recent test profiles</p>
              <p className="mt-1 text-xs text-slate-400">Reusable traffic configurations</p>
            </div>
            {items.length ? (
              <Link href="/app/tests" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-ink-950">
                View all <ArrowRight className="size-3.5" />
              </Link>
            ) : null}
          </div>

          {tests.isLoading ? (
            <div className="panel space-y-4 p-5" aria-label="Loading test profiles">
              {[0, 1, 2].map((item) => <div className="h-12 animate-pulse rounded-xl bg-slate-100" key={item} />)}
            </div>
          ) : null}

          {!tests.isLoading && !tests.isError && items.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="No test profiles yet"
              description="Verify a target, then create your first reusable traffic profile."
              action={<ButtonLink to="/app/tests/new">Create your first test</ButtonLink>}
            />
          ) : null}

          {items.length ? (
            <div className="overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.045)]">
              {items.slice(0, 5).map((test, index) => (
                <Link
                  key={test.id}
                  href={`/app/tests/${test.id}`}
                  className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/80"
                  style={{ borderTop: index ? '1px solid rgb(241 245 249)' : undefined }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <p className="truncate text-sm font-bold text-slate-800">{test.name}</p>
                      <StatusBadge status={test.status} />
                    </div>
                    <p className="mt-1.5 truncate text-xs text-slate-400">
                      <span className="font-bold text-violet-600">{test.method}</span>{' '}{test.targetUrl}
                    </p>
                  </div>
                  <div className="hidden shrink-0 items-center gap-5 sm:flex">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-600">{formatCompactNumber(test.virtualUsers)} users</p>
                      <p className="mt-1 text-[0.68rem] text-slate-400">{formatDate(test.createdAt)}</p>
                    </div>
                    <ArrowUpRight className="size-4 text-slate-300 group-hover:text-slate-700" />
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="rounded-[1.4rem] border border-slate-200/80 bg-white p-6 shadow-[0_14px_45px_rgba(15,23,42,0.045)]">
          <p className="eyebrow text-violet-600">A safe first run</p>
          <h2 className="mt-3 text-xl font-[780] tracking-[-0.035em] text-ink-950">From target to insight.</h2>
          <div className="mt-7 space-y-6">
            {[
              ['01', 'Verify ownership', 'Prove control of the hostname.'],
              ['02', 'Shape the traffic', 'Set users, duration, and thresholds.'],
              ['03', 'Watch the signals', 'Follow live performance and errors.'],
            ].map(([number, title, copy], index) => (
              <div className="relative flex gap-4" key={number}>
                {index < 2 ? <span className="absolute left-[17px] top-9 h-9 w-px bg-slate-200" /> : null}
                <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 font-mono text-[0.62rem] font-bold text-slate-500">{number}</span>
                <div><p className="text-sm font-bold text-slate-800">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{copy}</p></div>
              </div>
            ))}
          </div>
          <Link href="/app/targets" className="mt-8 inline-flex items-center gap-2 text-xs font-extrabold text-signal-600 hover:text-signal-500">
            Verify your target <ArrowRight className="size-3.5" />
          </Link>
        </aside>
      </section>
    </>
  );
}

function LiveLoadVisual() {
  return (
    <section className="dashboard-motion relative overflow-hidden rounded-[1.7rem] bg-ink-950 text-white shadow-[0_28px_80px_rgba(11,16,32,0.16)]">
      <div className="grid-lines absolute inset-0 opacity-40" />
      <div className="absolute -right-24 -top-32 size-96 rounded-full bg-violet-500/20 blur-[120px]" />
      <div className="absolute -bottom-40 left-1/3 size-96 rounded-full bg-signal-400/10 blur-[120px]" />

      <div className="relative grid min-h-[400px] lg:grid-cols-[250px_1fr_230px]">
        <div className="border-b border-white/[0.07] p-6 lg:border-b-0 lg:border-r lg:p-7">
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="flex items-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-signal-400">
                <Radio className="size-3.5" /> Live simulation
              </p>
              <h2 className="mt-3 text-xl font-[780] tracking-[-0.035em]">Checkout API</h2>
              <p className="mt-1 text-xs text-slate-500">10,000 virtual users</p>
            </div>
            <span className="rounded-full border border-signal-400/20 bg-signal-400/10 px-2.5 py-1 text-[0.62rem] font-bold text-signal-400 lg:mt-5 lg:inline-flex">Running</span>
          </div>
          <div className="mt-8 hidden space-y-3 lg:block">
            {['Resolve target', 'Warm workers', 'Ramp traffic', 'Capture metrics'].map((step, index) => (
              <div className="flex items-center gap-3" key={step}>
                <span className={`grid size-6 place-items-center rounded-full text-[0.6rem] font-bold ${index < 3 ? 'bg-signal-400 text-ink-950' : 'border border-white/10 bg-white/5 text-slate-500'}`}>
                  {index < 3 ? <CheckCircle2 className="size-3.5" /> : index + 1}
                </span>
                <span className={`text-xs font-semibold ${index < 3 ? 'text-slate-300' : 'text-slate-600'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[290px] flex-col justify-between p-6 lg:p-7">
          <div className="flex items-center justify-between">
            <div><p className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-600">Requests / second</p><p className="mt-1 text-2xl font-[800] tracking-tight">8,432</p></div>
            <div className="flex items-center gap-2 text-[0.64rem] font-bold text-signal-400"><Zap className="size-3.5" /> +18.4%</div>
          </div>
          <div className="relative mt-5 h-52 overflow-hidden rounded-xl bg-black/10">
            <div className="chart-grid absolute inset-0 opacity-70" />
            <div className="dashboard-scan absolute inset-y-0 w-36 bg-gradient-to-r from-transparent via-violet-400/[0.08] to-transparent" />
            <svg viewBox="0 0 700 210" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="dashboard-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2dd4a7" stopOpacity=".22" /><stop offset="1" stopColor="#2dd4a7" stopOpacity="0" /></linearGradient></defs>
              <path d="M0 180 C48 172 62 145 105 153 S165 116 208 129 S274 92 320 105 S382 62 430 77 S497 48 540 57 S615 26 700 38 L700 210 L0 210 Z" fill="url(#dashboard-fill)" />
              <path className="dashboard-line" d="M0 180 C48 172 62 145 105 153 S165 116 208 129 S274 92 320 105 S382 62 430 77 S497 48 540 57 S615 26 700 38" fill="none" stroke="#2dd4a7" strokeLinecap="round" strokeWidth="3" />
            </svg>
            <span className="request-particle request-particle-one absolute size-2 rounded-full bg-signal-400 shadow-[0_0_14px_#2dd4a7]" />
            <span className="request-particle request-particle-two absolute size-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_#8b7dff]" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px border-t border-white/[0.07] bg-white/[0.07] lg:grid-cols-1 lg:border-l lg:border-t-0">
          {[
            ['184 ms', 'p95 latency', 'text-white'],
            ['0.18%', 'error rate', 'text-signal-400'],
            ['20', 'active workers', 'text-violet-300'],
          ].map(([value, label, color]) => (
            <div className="flex flex-col justify-center bg-ink-950/90 p-5 lg:p-7" key={label}>
              <p className={`text-xl font-[800] tracking-[-0.04em] sm:text-2xl ${color}`}>{value}</p>
              <p className="mt-2 text-[0.58rem] font-bold uppercase tracking-wider text-slate-600 sm:text-[0.64rem]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
