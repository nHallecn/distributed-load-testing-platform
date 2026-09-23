import { HttpMethod } from '@app/config';
import { StopConditions } from '@app/domain';

export const EXECUTE_TEST_JOB = 'execute-test-partition';

export interface ExecuteTestJob {
  runId: string;
  testId: string;
  partition: number;
  totalPartitions: number;
  virtualUsers: number;
  targetUrl: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body: unknown;
  durationSeconds: number;
  rampUpSeconds: number;
  stopConditions: StopConditions;
}
