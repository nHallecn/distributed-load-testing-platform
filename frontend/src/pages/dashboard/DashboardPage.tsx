import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  FlaskConical,
  Gauge,
  Plus,
  ServerCog,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { formatCompactNumber, formatDate } from '../../lib/format';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorNotice } from '../../components/ui/ErrorNotice';
import { LoadingPanel } from '../../components/ui/LoadingPanel';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function DashboardPage() {
  const tests = useQuery({
    queryKey: ['tests'],
    queryFn: api.listTests,
  });

  if (tests.isLoading) return <LoadingPanel />;
  if (tests.isError) return <ErrorNotice message={tests.error.message} />;

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
      <PageHeader
        eyebrow="Control plane"
        title="Good testing starts with a clear signal."
        description="Create authorized load profiles, dispatch distributed workers, and keep the evidence from every run in one place."
        actions={
          <ButtonLink to="/app/tests/new" icon={<Plus className="size-4" />}>
            New load test
          </ButtonLink>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Test profiles',
            value: items.length.toString(),
            note: `${ready} ready to run`,
            icon: FlaskConical,
            tone: 'bg-violet-50 text-violet-600',
          },
          {
            label: 'Planned capacity',
            value: formatCompactNumber(plannedUsers),
            note: 'virtual users',
            icon: Gauge,
            tone: 'bg-signal-50 text-signal-600',
          },
          {
            label: 'Worker demand',
            value: workers.toString(),
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

          {items.length === 0 ? (
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
          ) : (
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
          )}
        </div>

        <aside className="relative overflow-hidden rounded-2xl bg-ink-950 p-6 text-white shadow-panel">
          <div className="grid-lines absolute inset-0 opacity-40" />
          <div className="relative">
            <span className="grid size-10 place-items-center rounded-xl bg-signal-400 text-ink-950">
              <Sparkles className="size-4" />
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
