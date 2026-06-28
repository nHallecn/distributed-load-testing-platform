import { RunStatus, TERMINAL_RUN_STATUSES } from '@app/config';
import { ConflictException, Injectable } from '@nestjs/common';

const transitions: Record<RunStatus, ReadonlySet<RunStatus>> = {
  [RunStatus.QUEUED]: new Set([
    RunStatus.STARTING,
    RunStatus.STOPPING,
    RunStatus.FAILED,
    RunStatus.CANCELLED,
  ]),
  [RunStatus.STARTING]: new Set([
    RunStatus.RUNNING,
    RunStatus.STOPPING,
    RunStatus.FAILED,
  ]),
  [RunStatus.RUNNING]: new Set([
    RunStatus.STOPPING,
    RunStatus.COMPLETED,
    RunStatus.FAILED,
  ]),
  [RunStatus.STOPPING]: new Set([
    RunStatus.CANCELLED,
    RunStatus.COMPLETED,
    RunStatus.FAILED,
  ]),
  [RunStatus.COMPLETED]: new Set(),
  [RunStatus.FAILED]: new Set(),
  [RunStatus.CANCELLED]: new Set(),
};

@Injectable()
export class RunStateService {
  assertTransition(current: RunStatus, next: RunStatus) {
    if (!transitions[current].has(next)) {
      throw new ConflictException(
        `Run cannot transition from ${current} to ${next}`,
      );
    }
  }

  isTerminal(status: RunStatus) {
    return TERMINAL_RUN_STATUSES.has(status);
  }
}
