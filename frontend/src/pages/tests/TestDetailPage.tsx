import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Clock3,
  Gauge,
  Play,
  ServerCog,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  formatCompactNumber,
  formatDate,
  formatDuration,
} from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { ErrorNotice } from '../../components/ui/ErrorNotice';
import { LoadingPanel } from '../../components/ui/LoadingPanel';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function TestDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const test = useQuery({
    queryKey: ['tests', id],
    queryFn: () => api.getTest(id),
    enabled: Boolean(id),
  });
  const start = useMutation({
    mutationFn: () => api.startRun(id),
    onSuccess: async (run) => {
      await queryClient.invalidateQueries({ queryKey: ['tests'] });
      await navigate(`/app/runs/${run.id}`);
    },
  });

  if (test.isLoading) return <LoadingPanel />;
  if (test.isError) return <ErrorNotice message={test.error.message} />;
  if (!test.data) return null;

  const item = test.data;
  const workerCount = Math.ceil(item.virtualUsers / 500);

  return (
    <>
      <Link
        to="/app/tests"
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-ink-950"
      >
        <ArrowLeft className="size-3.5" />
        Back to tests
      </Link>

      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-2xl font-[780] tracking-[-0.04em] text-ink-950 sm:text-[2rem]">
              {item.name}
            </h1>
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-2 break-all text-sm text-slate-500">
            <span className="mr-2 font-extrabold text-violet-600">
              {item.method}
            </span>
            {item.targetUrl}
          </p>
        </div>
        <Button
          icon={<Play className="size-4 fill-current" />}
          loading={start.isPending}
          onClick={() => start.mutate()}
          disabled={item.status !== 'ready'}
        >
          Start run
        </Button>
      </div>

      {start.isError ? (
        <div className="mb-5">
          <ErrorNotice message={start.error.message} />
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Virtual users',
            value: formatCompactNumber(item.virtualUsers),
            note: 'peak concurrency',
            icon: Gauge,
          },
          {
            label: 'Duration',
            value: formatDuration(item.durationSeconds),
            note: `${formatDuration(item.rampUpSeconds)} ramp-up`,
            icon: Clock3,
          },
          {
            label: 'Worker plan',
            value: workerCount.toString(),
            note: 'partitions required',
            icon: ServerCog,
          },
          {
            label: 'Target gate',
            value: item.targetVerificationId ? 'Verified' : 'Required',
            note: 'ownership control',
            icon: ShieldCheck,
          },
        ].map(({ label, value, note, icon: Icon }) => (
          <article className="panel p-5" key={label}>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Icon className="size-4 text-signal-600" />
              {label}
            </div>
            <p className="mt-4 text-2xl font-[780] tracking-[-0.04em] text-ink-950">
              {value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="panel p-6">
          <p className="eyebrow">Request definition</p>
          <dl className="mt-5 space-y-4">
            {[
              ['HTTP method', item.method],
              ['Expected response', item.expectedResponseTimeMs ? `${item.expectedResponseTimeMs} ms` : 'Not set'],
              ['Created', formatDate(item.createdAt)],
              ['Last updated', formatDate(item.updatedAt)],
            ].map(([label, value]) => (
              <div className="flex justify-between gap-6 text-sm" key={label}>
                <dt className="text-slate-400">{label}</dt>
                <dd className="text-right font-semibold text-slate-700">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <p className="label">Headers</p>
            <pre className="max-h-52 overflow-auto rounded-xl bg-ink-950 p-4 text-xs leading-5 text-slate-300">
              {JSON.stringify(item.headers, null, 2)}
            </pre>
          </div>
        </article>

        <article className="panel p-6">
          <p className="eyebrow">Automatic stop conditions</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                Error rate
              </p>
              <p className="mt-3 text-xl font-bold text-ink-950">
                {item.stopConditions.maxErrorRatePercent !== undefined
                  ? `${item.stopConditions.maxErrorRatePercent}%`
                  : 'Not set'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                p95 latency
              </p>
              <p className="mt-3 text-xl font-bold text-ink-950">
                {item.stopConditions.maxP95LatencyMs !== undefined
                  ? `${item.stopConditions.maxP95LatencyMs} ms`
                  : 'Not set'}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-signal-100 bg-signal-50 p-4 text-xs leading-5 text-signal-600">
            Workers check these thresholds continuously. Reaching either
            configured limit requests a coordinated stop across all partitions.
          </div>
        </article>
      </section>
    </>
  );
}
