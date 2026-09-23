import { aggregateMetricSnapshots } from './metrics';
import type { MetricSnapshot } from './types';

const snapshot = (
  workerId: string,
  requests: number,
  failed: number,
): MetricSnapshot => ({
  id: workerId,
  runId: 'run',
  workerId,
  recordedAt: '2026-06-29T12:00:00.100Z',
  requestsPerSecond: requests,
  totalRequests: String(requests),
  failedRequests: String(failed),
  p95LatencyMs: 100,
  latencySumMs: requests * 20,
  latencyBuckets: { '50': requests, '100': requests },
  activeVirtualUsers: 10,
  statusCodes: {},
});

describe('aggregateMetricSnapshots', () => {
  it('merges worker snapshots from the same second', () => {
    const [point] = aggregateMetricSnapshots([
      snapshot('one', 20, 1),
      snapshot('two', 30, 2),
    ]);

    expect(point).toMatchObject({
      requestsPerSecond: 50,
      activeVirtualUsers: 20,
      p95LatencyMs: 50,
      errorRatePercent: 6,
    });
  });
});
