import { clsx } from 'clsx';
import { statusLabel } from '../../lib/format';

const toneByStatus: Record<string, string> = {
  ready: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  running: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  starting: 'bg-violet-50 text-violet-700 ring-violet-600/15',
  queued: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  stopping: 'bg-orange-50 text-orange-700 ring-orange-600/15',
  failed: 'bg-red-50 text-red-700 ring-red-600/15',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  draft: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  expired: 'bg-red-50 text-red-700 ring-red-600/15',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold tracking-wide ring-1 ring-inset',
        toneByStatus[status] ??
          'bg-slate-100 text-slate-600 ring-slate-500/15',
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {statusLabel(status)}
    </span>
  );
}
