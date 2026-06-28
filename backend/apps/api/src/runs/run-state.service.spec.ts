import { ConflictException } from '@nestjs/common';
import { RunStatus } from '@app/config';
import { RunStateService } from './run-state.service';

describe('RunStateService', () => {
  const service = new RunStateService();

  it('allows an active run to begin stopping', () => {
    expect(() =>
      service.assertTransition(RunStatus.RUNNING, RunStatus.STOPPING),
    ).not.toThrow();
  });

  it('rejects restarting a completed run', () => {
    expect(() =>
      service.assertTransition(RunStatus.COMPLETED, RunStatus.RUNNING),
    ).toThrow(ConflictException);
  });
});
