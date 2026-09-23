import { Activity } from 'lucide-react';
import { clsx } from 'clsx';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-xl bg-signal-400 text-ink-950 shadow-[0_0_24px_rgba(45,212,167,0.2)]">
        <Activity className="size-[1.15rem]" strokeWidth={2.6} />
      </span>
      <span
        className={clsx(
          'font-[850] tracking-[-0.04em] text-white',
          compact ? 'text-base' : 'text-lg',
        )}
      >
        LOAD<span className="text-signal-400">GRID</span>
      </span>
    </div>
  );
}
