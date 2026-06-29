import { formatDuration, isActiveRun } from './format';

describe('formatDuration', () => {
  it('formats seconds', () => {
    expect(formatDuration(45)).toBe('45s');
  });

  it('formats composite durations', () => {
    expect(formatDuration(3_725)).toBe('1h 2m 5s');
  });
});

describe('isActiveRun', () => {
  it('recognizes active and terminal states', () => {
    expect(isActiveRun('running')).toBe(true);
    expect(isActiveRun('completed')).toBe(false);
  });
});
