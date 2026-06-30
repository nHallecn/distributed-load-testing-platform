import { ArrowUpRight, CircleCheck, Network, RadioTower } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Logo } from '../components/brand/Logo';

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(520px,0.86fr)]">
      <section className="relative hidden overflow-hidden bg-ink-950 p-12 text-white lg:flex lg:flex-col">
        <div className="grid-lines absolute inset-0 opacity-60" />
        <div className="absolute -left-40 top-1/3 size-96 rounded-full bg-violet-500/20 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 size-80 rounded-full bg-signal-400/15 blur-[100px]" />
        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 my-auto max-w-xl">
          <p className="eyebrow mb-5 text-signal-400">Performance command center</p>
          <h1 className="text-[3.4rem] font-[780] leading-[1.02] tracking-[-0.055em]">
            Find the breaking point
            <span className="text-slate-500"> before users do.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
            Coordinate distributed workers, watch latency move in real time,
            and turn every run into an evidence-backed performance decision.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <Network className="size-5 text-signal-400" />
              <p className="mt-5 text-2xl font-bold tracking-tight">500</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Users / worker
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <RadioTower className="size-5 text-violet-500" />
              <p className="mt-5 text-2xl font-bold tracking-tight">Live</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Metrics stream
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <CircleCheck className="size-4 text-signal-400" />
            Authorized targets only
          </span>
          <span className="flex items-center gap-1">
            Cloud-native architecture
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 lg:hidden">
            <div className="[&_*]:!text-ink-950">
              <Logo />
            </div>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
