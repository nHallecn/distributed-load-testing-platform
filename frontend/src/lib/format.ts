import type { RunStatus } from './types';

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    hours ? `${hours}h` : '',
    minutes ? `${minutes}m` : '',
    seconds ? `${seconds}s` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function formatCompactNumber(value: number | string): string {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value));
}

export function formatNumber(value: number | string): string {
  return new Intl.NumberFormat('en').format(Number(value));
}

export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatLatency(value: number | null): string {
  if (value === null) return '—';
  if (value < 1000) return `${Math.round(value)} ms`;
  return `${(value / 1000).toFixed(2)} s`;
}

export function formatPercent(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(2)}%`;
}

export function isActiveRun(status: RunStatus): boolean {
  return ['queued', 'starting', 'running', 'stopping'].includes(status);
}

export function statusLabel(status: string): string {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) =>
    letter.toUpperCase(),
  );
}
