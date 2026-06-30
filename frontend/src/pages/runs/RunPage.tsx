import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowLeft,
  CircleStop,
  Clock3,
  Gauge,
  ServerCog,
  TriangleAlert,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { ErrorNotice } from '../../components/ui/ErrorNotice';
import { LoadingPanel } from '../../components/ui/LoadingPanel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../lib/api';
import {
  formatCompactNumber,
  formatDate,
  formatLatency,
  formatNumber,
  formatPercent,
  isActiveRun,
} from '../../lib/format';
import { aggregateMetricSnapshots } from '../../lib/metrics';

const tooltipStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
  fontSize: '12px',
};

export function RunPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const run = useQuery({
    queryKey: ['runs', id],
    queryFn: () => api.getRun(id),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data && isActiveRun(query.state.data.status) ? 2_000 : false,
  });
  const metrics = useQuery({
    queryKey: ['runs', id, 'metrics'],
    queryFn: () => api.getRunMetrics(id),
    enabled: Boolean(run.data),
    refetchInterval: () =>
      run.data && isActiveRun(run.data.status) ? 2_000 : false,
  });
  const report = useQuery({
    queryKey: ['runs', id, 'report'],
    queryFn: () => api.getRunReport(id),
    enabled: Boolean(run.data && !isActiveRun(run.data.status)),
  });
  const stop = useMutation({
    mutationFn: () => api.stopRun(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['runs', id] });
    },
  });

  if (run.isLoading) return <LoadingPanel />;
  if (run.isError) return <ErrorNotice message={run.error.message} />;
  if (!run.data) return null;

  const item = run.data;
  const chartData = aggregateMetricSnapshots(metrics.data ?? []);
  const latest = chartData.at(-1);
  const statusCodes = Object.entries(
    (metrics.data ?? []).reduce<Record<string, number>>((result, snapshot) => {
      for (const [code, count] of Object.entries(snapshot.statusCodes)) {
        result[code] = (result[code] ?? 0) + count;
      }
      return result;
    }, {}),
  ).sort((left, right) => right[1] - left[1]);

  return (
    <>
      <Link
        to={item.testId ? `/app/tests/${item.testId}` : '/app/tests'}
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-ink-950"
      >
        <ArrowLeft className="size-3.5" />
        Back to test profile
      </Link>

      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-[780] tracking-[-0.04em] text-ink-950 sm:text-[2rem]">
              Live run
            </h1>
            <StatusBadge status={item.status} />
            {isActiveRun(item.status) ? (
              <span className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-wider text-signal-600">
                <span className="signal-pulse size-2 rounded-full bg-signal-400" />
                Polling every 2s
              </span>
            ) : null}
          </div>
          <p className="mt-2 font-mono text-xs text-slate-400">{item.id}</p>
          {item.test ? (
            <p className="mt-2 text-sm text-slate-500">
              {item.test.name} · {item.test.method} {item.test.targetUrl}
            </p>
          ) : null}
        </div>
        {isActiveRun(item.status) && item.status !== 'stopping' ? (
          <Button
            variant="danger"
            icon={<CircleStop className="size-4" />}
            loading={stop.isPending}
            onClick={() => stop.mutate()}
          >
            Stop run
          </Button>
        ) : null}
      </div>

      {stop.isError ? (
        <div className="mb-5">
          <ErrorNotice message={stop.error.message} />
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Requests / second"
          value={latest ? formatNumber(latest.requestsPerSecond) : '—'}
          note="current throughput"
          icon={Activity}
          tone="text-signal-600 bg-signal-50"
        />
        <MetricCard
          label="p95 latency"
          value={
            latest
              ? formatLatency(latest.p95LatencyMs)
              : formatLatency(item.p95LatencyMs)
          }
          note="95th percentile"
          icon={Clock3}
          tone="text-violet-600 bg-violet-50"
        />
        <MetricCard
          label="Active users"
          value={latest ? formatCompactNumber(latest.activeVirtualUsers) : '—'}
          note={`${item.desiredWorkers} worker partitions`}
          icon={Gauge}
          tone="text-sky-600 bg-sky-50"
        />
        <MetricCard
          label="Error rate"
          value={
            latest
              ? formatPercent(latest.errorRatePercent)
              : formatPercent(item.errorRatePercent)
          }
          note="failed / total"
          icon={TriangleAlert}
          tone="text-amber-600 bg-amber-50"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Request throughput"
          note="Aggregated across worker partitions"
        >
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rpsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4a7" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#2dd4a7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf1f6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} minTickGap={32} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="requestsPerSecond" name="Requests/s" stroke="#15b88a" strokeWidth={2.2} fill="url(#rpsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty />
          )}
        </ChartPanel>

        <ChartPanel title="Latency & errors" note="p95 latency with error-rate overlay">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#edf1f6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} minTickGap={32} />
                <YAxis yAxisId="latency" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="errors" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line yAxisId="latency" type="monotone" dataKey="p95LatencyMs" name="p95 latency (ms)" stroke="#7567f8" strokeWidth={2.2} dot={false} />
                <Line yAxisId="errors" type="monotone" dataKey="errorRatePercent" name="Error rate (%)" stroke="#f59e0b" strokeWidth={1.8} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty />
          )}
        </ChartPanel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.45fr)]">
        <article className="panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ink-950">Run summary</p>
              <p className="mt-1 text-xs text-slate-400">
                Durable totals update when the run finalizes
              </p>
            </div>
            <ServerCog className="size-5 text-slate-300" />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
            {[
              ['Total requests', formatNumber(report.data?.totalRequests ?? item.totalRequests)],
              ['Successful', formatNumber(report.data?.successfulRequests ?? item.successfulRequests)],
              ['Failed', formatNumber(report.data?.failedRequests ?? item.failedRequests)],
              ['Average latency', formatLatency(report.data?.averageLatencyMs ?? item.averageLatencyMs)],
              ['p95 latency', formatLatency(report.data?.p95LatencyMs ?? item.p95LatencyMs)],
              ['p99 latency', formatLatency(report.data?.p99LatencyMs ?? item.p99LatencyMs)],
              ['Started', formatDate(item.startedAt)],
              ['Ended', formatDate(item.endedAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </dt>
                <dd className="mt-2 text-sm font-bold text-slate-700">{value}</dd>
              </div>
            ))}
          </dl>
          {item.stopReason ? (
            <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Stop reason: <span className="font-semibold">{item.stopReason}</span>
            </p>
          ) : null}
        </article>

        <article className="panel p-6">
          <p className="text-sm font-bold text-ink-950">Response distribution</p>
          <p className="mt-1 text-xs text-slate-400">HTTP and network outcomes</p>
          <div className="mt-5 space-y-3">
            {statusCodes.length ? (
              statusCodes.slice(0, 8).map(([code, count]) => (
                <div className="flex items-center justify-between" key={code}>
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-600">
                    {code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {formatNumber(count)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-slate-400">
                Waiting for response data…
              </p>
            )}
          </div>
        </article>
      </section>
    </>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  note: string;
  icon: typeof Activity;
  tone: string;
}

function MetricCard({ label, value, note, icon: Icon, tone }: MetricCardProps) {
  return (
    <article className="panel p-5">
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
  );
}

function ChartPanel({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <article className="panel p-5 sm:p-6">
      <div>
        <p className="text-sm font-bold text-ink-950">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{note}</p>
      </div>
      <div className="mt-5 h-64">{children}</div>
    </article>
  );
}

function ChartEmpty() {
  return (
    <div className="grid h-full place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60">
      <div className="text-center">
        <Activity className="mx-auto size-5 text-slate-300" />
        <p className="mt-2 text-xs text-slate-400">Waiting for worker metrics…</p>
      </div>
    </div>
  );
}
