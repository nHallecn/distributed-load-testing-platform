import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="text-2xl font-[780] tracking-[-0.035em] text-ink-950 sm:text-[2rem]">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
      {actions ? <div className="flex shrink-0 gap-3">{actions}</div> : null}
    </div>
  );
}
