import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-signal-500 bg-signal-500 text-ink-950 hover:border-signal-400 hover:bg-signal-400',
  secondary:
    'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
  danger:
    'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100',
  ghost:
    'border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
};

export function buttonClassName(
  variant: ButtonVariant = 'primary',
  className?: string,
) {
  return clsx(
    'inline-flex min-h-10 items-center justify-center gap-2 rounded-[0.7rem] border px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    className,
  );
}
