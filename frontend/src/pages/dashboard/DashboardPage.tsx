import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FlaskConical,
  Gauge,
  Orbit,
  Plus,
  Radio,
  ServerCog,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { formatCompactNumber, formatDate } from '../../lib/format';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorNotice } from '../../components/ui/ErrorNotice';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function DashboardPage() {
  const tests = useQuery({
    queryKey: ['tests'],
    queryFn: api.listTests,
  });

  const items = tests.data ?? [];
  const ready = items.filter((test) => test.status === 'ready').length;
  const plannedUsers = items.reduce(
    (total, test) => total + test.virtualUsers,
    0,
  );
  const workers = items.reduce(
    (total, test) => total + Math.ceil(test.virtualUsers / 500),
    0,
  );

  return (
    <>
      <DashboardHero />

      {tests.isError ? (
        <div className="mb-6">
          <ErrorNotice message={tests.error.message} />
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Test profiles',
            value: tests.isLoading ? '—' : items.length.toString(),
            note: tests.isLoading ? 'loading profiles' : `${ready} ready to run`,
            icon: FlaskConical,
            tone: 'bg-violet-50 text-violet-600',
          },
          {
            label: 'Planned capacity',
            value: tests.isLoading ? '—' : formatCompactNumber(plannedUsers),
            note: 'virtual users',
            icon: Gauge,
            tone: 'bg-signal-50 text-signal-600',
          },
          {
            label: 'Worker demand',
            value: tests.isLoading ? '—' : workers.toString(),
            note: 'at 500 users each',
            icon: ServerCog,
            tone: 'bg-sky-50 text-sky-600',
          },
          {
            label: 'Safety controls',
            value: 'Active',
            note: 'verification required',
            icon: ShieldCheck,
            tone: 'bg-amber-50 text-amber-600',
          },
        ].map(({ label, value, note, icon: Icon, tone }) => (
          <article className="panel p-5" key={label}>
            <div className="flex items-start justify-between">
              <p className="text-xs font-bold text-slate-500">{label}</p>
              <span className={`grid size-9 place-items-center rounded-xl ${tone}`}>
                <Icon className="size-4" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-[780] tracking-[-0.04em] text-ink-950">
              {value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.72fr)]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ink-950">Recent profiles</p>
              <p className="mt-1 text-xs text-slate-400">
                Reusable traffic configurations
              </p>
            </div>
            {items.length ? (
              <Link
                to="/app/tests"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-ink-950"
              >
                View all <ArrowRight className="size-3.5" />
              </Link>
            ) : null}
          </div>

          {tests.isLoading ? (
            <div className="panel space-y-4 p-5" aria-label="Loading test profiles">
              {[0, 1, 2].map((item) => (
                <div className="h-12 animate-pulse rounded-xl bg-slate-100" key={item} />
              ))}
            </div>
          ) : null}

          {!tests.isLoading && !tests.isError && items.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="No test profiles yet"
              description="Verify a target, then create your first reusable traffic profile."
              action={
                <ButtonLink to="/app/targets" variant="secondary">
                  Verify a target
                </ButtonLink>
              }
            />
          ) : null}

          {items.length ? (
            <div className="panel overflow-hidden">
              {items.slice(0, 5).map((test, index) => (
                <Link
                  key={test.id}
                  to={`/app/tests/${test.id}`}
                  className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/80"
                  style={{
                    borderTop: index ? '1px solid rgb(241 245 249)' : undefined,
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {test.name}
                      </p>
                      <StatusBadge status={test.status} />
                    </div>
                    <p className="mt-1.5 truncate text-xs text-slate-400">
                      <span className="font-bold text-slate-500">{test.method}</span>{' '}
                      {test.targetUrl}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs font-bold text-slate-600">
                      {formatCompactNumber(test.virtualUsers)} users
                    </p>
                    <p className="mt-1 text-[0.68rem] text-slate-400">
                      {formatDate(test.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="relative overflow-hidden rounded-2xl bg-ink-950 p-6 text-white shadow-panel">
          <div className="grid-lines absolute inset-0 opacity-40" />
          <div className="relative">
            <span className="grid size-10 place-items-center rounded-xl bg-signal-400 text-ink-950">
              <ShieldCheck className="size-4" />
            </span>
            <p className="eyebrow mt-6 text-signal-400">Recommended workflow</p>
            <h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">
              Verify before you generate.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Domain ownership is the first gate. Once verified, profiles can be
              safely reused for repeatable regression testing.
            </p>
            <ol className="mt-6 space-y-3">
              {['Verify target ownership', 'Define the load profile', 'Run and watch signals'].map(
                (step, index) => (
                  <li
                    className="flex items-center gap-3 text-xs font-semibold text-slate-300"
                    key={step}
                  >
                    <span className="grid size-6 place-items-center rounded-full border border-white/10 bg-white/5 text-[0.65rem] text-signal-400">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ),
              )}
            </ol>
            <Link
              to="/app/targets"
              className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-signal-400 hover:text-signal-100"
            >
              Open target access <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}

function DashboardHero() {
  return (
    <section className="hero-surface relative mb-7 overflow-hidden rounded-[1.75rem] bg-ink-950 text-white shadow-[0_28px_80px_rgba(11,16,32,0.2)]">
      <div className="grid-lines absolute inset-0 opacity-35" />
      <div className="hero-glow hero-glow-left absolute -left-32 -top-36 size-[30rem] rounded-full bg-violet-500/25 blur-[110px]" />
      <div className="hero-glow hero-glow-right absolute -bottom-48 right-0 size-[32rem] rounded-full bg-signal-400/20 blur-[120px]" />

      <div className="relative grid min-h-[480px] items-center gap-12 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:px-12 lg:py-14">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-signal-400 backdrop-blur-md">
            <span className="signal-pulse size-1.5 rounded-full bg-signal-400" />
            No signup · Free to use
          </div>
          <h1 className="max-w-[720px] text-[2.8rem] font-[820] leading-[0.98] tracking-[-0.06em] sm:text-[4rem] lg:text-[4.45rem]">
            Find the limit.
            <span className="block text-slate-500">Before users do.</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Launch distributed load tests, watch performance signals move in
            real time, and turn every run into a confident engineering decision.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              to="/app/tests/new"
              className="hero-cta !min-h-12 !rounded-xl !px-5"
              icon={<Plus className="size-4" />}
            >
              Create a load test
            </ButtonLink>
            <ButtonLink
              to="/app/targets"
              variant="ghost"
              className="!min-h-12 !rounded-xl !border-white/10 !bg-white/[0.04] !px-5 !text-slate-200 hover:!bg-white/[0.08] hover:!text-white"
              icon={<ShieldCheck className="size-4" />}
            >
              Verify a target
            </ButtonLink>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[0.7rem] font-semibold text-slate-500">
            {['Public workspace', 'Live metrics', 'Safety guardrails'].map((item) => (
              <span className="flex items-center gap-2" key={item}>
                <CheckCircle2 className="size-3.5 text-signal-400" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto hidden h-[360px] w-full max-w-[470px] lg:block" aria-hidden="true">
          <div className="hero-orbit hero-orbit-outer absolute left-1/2 top-1/2 size-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]" />
          <div className="hero-orbit hero-orbit-inner absolute left-1/2 top-1/2 size-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-signal-400/20" />
          <div className="hero-core absolute left-1/2 top-1/2 grid size-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-signal-400/25 bg-signal-400/[0.08] shadow-[0_0_80px_rgba(45,212,167,0.12)] backdrop-blur-sm">
            <div className="grid size-16 place-items-center rounded-2xl bg-signal-400 text-ink-950 shadow-[0_0_40px_rgba(45,212,167,0.28)]">
              <Activity className="size-7" strokeWidth={2.4} />
            </div>
          </div>

          <TelemetryNode className="left-0 top-8" icon={Radio} label="Throughput" value="8.4k rps" delay="0s" />
          <TelemetryNode className="right-0 top-20" icon={Gauge} label="p95 latency" value="184 ms" delay="-1.1s" />
          <TelemetryNode className="bottom-3 left-12" icon={ServerCog} label="Workers" value="20 active" delay="-2.2s" />

          <div className="hero-packet hero-packet-one absolute left-[18%] top-[44%] size-2 rounded-full bg-violet-500 shadow-[0_0_14px_rgba(117,103,248,0.8)]" />
          <div className="hero-packet hero-packet-two absolute right-[20%] top-[56%] size-2 rounded-full bg-signal-400 shadow-[0_0_14px_rgba(45,212,167,0.8)]" />
          <Orbit className="hero-orbit-icon absolute bottom-12 right-12 size-5 text-slate-600" />
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-white/[0.07] px-6 py-4 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-600 sm:px-10 lg:px-12">
        <span>Distributed performance testing</span>
        <Link to="/app/tests" className="flex items-center gap-2 text-slate-400 hover:text-white">
          Explore the workspace <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}

function TelemetryNode({
  className,
  icon: Icon,
  label,
  value,
  delay,
}: {
  className: string;
  icon: typeof Activity;
  label: string;
  value: string;
  delay: string;
}) {
  return (
    <div
      className={`hero-telemetry absolute flex min-w-40 items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/85 p-3.5 shadow-2xl backdrop-blur-xl ${className}`}
      style={{ animationDelay: delay }}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-signal-400">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-600">{label}</p>
        <p className="mt-1 text-sm font-extrabold text-white">{value}</p>
      </div>
    </div>
  );
}
