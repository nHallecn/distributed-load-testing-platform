import type { MetricSnapshot } from './types';

const BUCKETS = [
  5, 10, 25, 50, 100, 250, 500, 1_000, 2_500, 5_000, 10_000, 30_000, 60_000,
];

export interface ChartPoint {
  timestamp: number;
  label: string;
  requestsPerSecond: number;
  activeVirtualUsers: number;
  p95LatencyMs: number;
  errorRatePercent: number;
}

interface Aggregate {
  timestamp: number;
  total: number;
  failed: number;
  requestsPerSecond: number;
  activeVirtualUsers: number;
  buckets: Record<string, number>;
}

export function aggregateMetricSnapshots(
  snapshots: MetricSnapshot[],
): ChartPoint[] {
  const groups = new Map<number, Aggregate>();

  for (const snapshot of snapshots) {
    const timestamp =
      Math.floor(new Date(snapshot.recordedAt).getTime() / 1000) * 1000;
    const group = groups.get(timestamp) ?? {
      timestamp,
      total: 0,
      failed: 0,
      requestsPerSecond: 0,
      activeVirtualUsers: 0,
      buckets: {},
    };
    group.total += Number(snapshot.totalRequests);
    group.failed += Number(snapshot.failedRequests);
    group.requestsPerSecond += snapshot.requestsPerSecond;
    group.activeVirtualUsers += snapshot.activeVirtualUsers;
    for (const [bucket, count] of Object.entries(snapshot.latencyBuckets)) {
      group.buckets[bucket] = (group.buckets[bucket] ?? 0) + count;
    }
    groups.set(timestamp, group);
  }

  return [...groups.values()]
    .sort((left, right) => left.timestamp - right.timestamp)
    .map((group) => ({
      timestamp: group.timestamp,
      label: new Intl.DateTimeFormat('en', {
        minute: '2-digit',
        second: '2-digit',
      }).format(group.timestamp),
      requestsPerSecond: Math.round(group.requestsPerSecond),
      activeVirtualUsers: group.activeVirtualUsers,
      p95LatencyMs: histogramPercentile(group.buckets, group.total, 0.95),
      errorRatePercent: group.total
        ? Number(((group.failed / group.total) * 100).toFixed(2))
        : 0,
    }));
}

function histogramPercentile(
  buckets: Record<string, number>,
  total: number,
  percentile: number,
): number {
  if (!total) return 0;
  const target = Math.ceil(total * percentile);
  for (const boundary of BUCKETS) {
    if ((buckets[String(boundary)] ?? 0) >= target) return boundary;
  }
  return 60_000;
}
