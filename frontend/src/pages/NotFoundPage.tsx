import { ArrowLeft, SearchX } from 'lucide-react';
import { ButtonLink } from '../components/ui/ButtonLink';

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-950 px-6 text-center text-white">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/5 text-signal-400">
          <SearchX className="size-6" />
        </span>
        <p className="eyebrow mt-6 text-signal-400">404 / no signal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          This route does not exist.
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Return to the control plane and continue from there.
        </p>
        <ButtonLink
          to="/app"
          className="mt-7"
          icon={<ArrowLeft className="size-4" />}
        >
          Back to overview
        </ButtonLink>
      </div>
    </main>
  );
}
