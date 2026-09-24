import {
  Activity,
  ArrowRight,
  Braces,
  Check,
  Gauge,
  GitBranch,
  Globe2,
  Play,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Logo } from '@/components/brand/Logo';

const productFeatures = [
  {
    icon: GitBranch,
    number: '01',
    title: 'Distribute real traffic',
    copy: 'Split virtual users across coordinated workers without building your own test infrastructure.',
    color: 'bg-violet-100 text-violet-700',
  },
  {
    icon: Activity,
    number: '02',
    title: 'Watch the system move',
    copy: 'Track throughput, latency, errors, and active users while a run is still in progress.',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: ShieldCheck,
    number: '03',
    title: 'Test with guardrails',
    copy: 'Ownership verification and automatic stop conditions keep every test intentional and controlled.',
    color: 'bg-amber-100 text-amber-700',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f8f5] text-ink-950">
      <header className="relative z-30 border-b border-slate-200/70 bg-[#f7f8f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1380px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label="LoadGrid home">
            <Logo darkText />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#product" className="hover:text-ink-950">Product</a>
            <a href="#how-it-works" className="hover:text-ink-950">How it works</a>
            <Link href="/app" className="hover:text-ink-950">Workspace</Link>
          </nav>
          <Link
            href="/app/tests/new"
            className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-ink-950 px-5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(11,16,32,0.14)] hover:-translate-y-0.5 hover:bg-ink-800"
          >
            Start a test
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      <main>
        <section className="px-3 pb-3 sm:px-5 sm:pb-5">
          <div className="landing-hero relative mx-auto min-h-[760px] max-w-[1500px] overflow-hidden rounded-[2rem] bg-ink-950 text-white sm:rounded-[2.5rem]">
            <div className="landing-grid absolute inset-0 opacity-70" />
            <div className="landing-aurora landing-aurora-one absolute -left-32 top-24 size-[32rem] rounded-full bg-violet-500/20 blur-[130px]" />
            <div className="landing-aurora landing-aurora-two absolute -right-36 -top-24 size-[38rem] rounded-full bg-signal-400/15 blur-[150px]" />

            <div className="relative mx-auto grid min-h-[760px] max-w-[1380px] items-center gap-14 px-6 py-16 sm:px-10 lg:px-16 lg:py-20 xl:grid-cols-[minmax(0,0.92fr)_minmax(480px,1.08fr)]">
              <div className="landing-reveal max-w-3xl">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-signal-400 backdrop-blur-md">
                  <Sparkles className="size-3.5" />
                  Free to use. No signup.
                </div>
                <h1 className="text-[3.5rem] font-[850] leading-[0.93] tracking-[-0.065em] sm:text-[5.2rem] xl:text-[5.6rem] 2xl:text-[6.15rem]">
                  Know what breaks
                  <span className="block bg-gradient-to-r from-signal-400 via-emerald-200 to-violet-300 bg-clip-text text-transparent">
                    before it does.
                  </span>
                </h1>
                <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
                  Run distributed load tests from your browser. See the limits,
                  find the bottlenecks, and ship with evidence instead of hope.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/app/tests/new"
                    className="group inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-signal-400 px-7 text-sm font-extrabold text-ink-950 shadow-[0_18px_45px_rgba(45,212,167,0.2)] hover:-translate-y-0.5 hover:bg-signal-100"
                  >
                    Test your system
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/app"
                    className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full border border-white/12 bg-white/[0.05] px-7 text-sm font-bold text-white backdrop-blur-md hover:bg-white/[0.1]"
                  >
                    <Play className="size-4 fill-current" />
                    View the workspace
                  </Link>
                </div>
                <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-500">
                  {['No credit card', 'Verified targets only', 'Live run metrics'].map((item) => (
                    <span className="flex items-center gap-2" key={item}>
                      <Check className="size-3.5 text-signal-400" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <ProductMotion />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1380px] px-6 py-20 sm:px-10 lg:px-12 lg:py-28" id="product">
          <div className="grid items-end gap-8 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-signal-600">One clear workflow</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-[820] leading-[1.02] tracking-[-0.055em] sm:text-6xl">
                Performance testing without the platform tax.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-slate-500 lg:justify-self-end">
              Everything you need to move from a target URL to a clear performance
              report lives in one focused workspace. No account setup and no toolchain
              to assemble.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {productFeatures.map(({ icon: Icon, number, title, copy, color }) => (
              <article
                key={number}
                className="group rounded-[1.75rem] border border-slate-200/80 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1 sm:p-9"
              >
                <div className="flex items-center justify-between">
                  <span className={`grid size-12 place-items-center rounded-2xl ${color}`}>
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300">{number}</span>
                </div>
                <h3 className="mt-12 text-xl font-[780] tracking-[-0.035em]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200/80 bg-white" id="how-it-works">
          <div className="mx-auto grid max-w-[1380px] gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[0.72fr_1.28fr] lg:px-12 lg:py-28">
            <div>
              <p className="eyebrow text-violet-600">From URL to insight</p>
              <h2 className="mt-4 text-4xl font-[820] leading-none tracking-[-0.055em] sm:text-5xl">
                Three steps.<br />One confident answer.
              </h2>
              <Link
                href="/app/tests/new"
                className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-ink-950 hover:text-signal-600"
              >
                Create your first test <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-200">
              {[
                ['Verify', 'Prove you control the target before any traffic is dispatched.', Globe2],
                ['Configure', 'Choose the request, virtual users, duration, ramp-up, and stop limits.', Braces],
                ['Observe', 'Follow live signals and finish with a report your team can act on.', Gauge],
              ].map(([title, copy, Icon], index) => {
                const StepIcon = Icon as typeof Globe2;
                return (
                  <div className="grid gap-5 py-7 first:pt-0 sm:grid-cols-[52px_150px_1fr] sm:items-center" key={title as string}>
                    <span className="grid size-11 place-items-center rounded-full bg-slate-100 font-mono text-xs font-bold text-slate-500">
                      0{index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <StepIcon className="size-4 text-violet-600" />
                      <h3 className="font-[780] text-ink-950">{title as string}</h3>
                    </div>
                    <p className="text-sm leading-6 text-slate-500">{copy as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-3 py-3 sm:px-5 sm:py-5">
          <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] bg-violet-600 px-6 py-20 text-center text-white sm:rounded-[2.5rem] sm:px-10 lg:py-28">
            <div className="landing-grid absolute inset-0 opacity-25" />
            <div className="relative mx-auto max-w-3xl">
              <Zap className="mx-auto size-7 text-signal-400" />
              <h2 className="mt-6 text-4xl font-[840] leading-none tracking-[-0.055em] sm:text-6xl">
                Your next bottleneck is already there.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-violet-100">
                Find it before production traffic does. Start in seconds, without an account.
              </p>
              <Link
                href="/app/tests/new"
                className="mt-8 inline-flex min-h-14 items-center gap-2 rounded-full bg-white px-7 text-sm font-extrabold text-violet-700 hover:-translate-y-0.5"
              >
                Start testing now <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1380px] flex-col gap-4 px-6 py-10 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12">
        <Logo compact darkText />
        <p>Free distributed load testing with safety built in.</p>
      </footer>
    </div>
  );
}

function ProductMotion() {
  return (
    <div className="landing-console landing-reveal landing-reveal-delay relative mx-auto w-full max-w-[670px]" aria-label="Animated load test preview">
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-violet-500/15 to-signal-400/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#101829]/95 shadow-[0_40px_100px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-400/70" />
            <span className="size-2 rounded-full bg-amber-300/70" />
            <span className="size-2 rounded-full bg-signal-400/70" />
          </div>
          <span className="flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-slate-500">
            <span className="signal-pulse size-1.5 rounded-full bg-signal-400" />
            Live run
          </span>
        </div>

        <div className="grid gap-0 sm:grid-cols-[1fr_180px]">
          <div className="border-b border-white/[0.07] p-5 sm:border-b-0 sm:border-r">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-600">Checkout API</p>
                <p className="mt-1 text-sm font-bold text-white">Ramp-up in progress</p>
              </div>
              <span className="rounded-full bg-signal-400/10 px-2.5 py-1 text-[0.62rem] font-bold text-signal-400">Healthy</span>
            </div>

            <div className="relative mt-7 h-48 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0b1120]">
              <div className="chart-grid absolute inset-0 opacity-80" />
              <div className="console-scan absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-signal-400/[0.08] to-transparent" />
              <svg viewBox="0 0 500 190" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 150 C38 148 46 126 82 132 S130 92 168 111 S218 62 252 82 S300 52 336 68 S390 31 425 50 S465 22 500 35" fill="none" stroke="rgba(45,212,167,.12)" strokeWidth="14" />
                <path className="console-line" d="M0 150 C38 148 46 126 82 132 S130 92 168 111 S218 62 252 82 S300 52 336 68 S390 31 425 50 S465 22 500 35" fill="none" stroke="#2dd4a7" strokeLinecap="round" strokeWidth="3" />
              </svg>
              <div className="absolute bottom-3 left-4 right-4 flex justify-between font-mono text-[0.55rem] text-slate-700">
                <span>00:00</span><span>00:20</span><span>00:40</span><span>01:00</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                ['8.4k', 'req / sec'],
                ['184', 'p95 ms'],
                ['0.18%', 'errors'],
              ].map(([value, label]) => (
                <div className="rounded-xl bg-white/[0.035] p-3" key={label}>
                  <p className="text-base font-[780] tracking-tight text-white">{value}</p>
                  <p className="mt-1 text-[0.58rem] font-bold uppercase tracking-wider text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-600">Worker mesh</p>
            <div className="mt-5 space-y-3">
              {[82, 68, 91, 74].map((load, index) => (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3" key={load}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[0.65rem] font-bold text-slate-300">
                      <ServerCog className="size-3.5 text-violet-300" />
                      node-0{index + 1}
                    </span>
                    <span className="font-mono text-[0.58rem] text-slate-600">{load}%</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="console-bar h-full rounded-full bg-gradient-to-r from-violet-500 to-signal-400" style={{ '--bar-width': `${load}%`, animationDelay: `${index * 180}ms` } as CSSProperties} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-signal-400/[0.07] p-3 text-[0.62rem] font-semibold text-signal-100">
              <ShieldCheck className="size-4 shrink-0 text-signal-400" />
              Target ownership verified
            </div>
          </div>
        </div>
      </div>

      <div className="console-float-card absolute -bottom-8 -left-3 hidden items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/95 p-3.5 shadow-2xl backdrop-blur-xl sm:flex">
        <span className="grid size-9 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><Zap className="size-4" /></span>
        <div><p className="text-[0.6rem] font-bold uppercase tracking-wider text-slate-600">Active users</p><p className="mt-0.5 text-sm font-extrabold text-white">10,000</p></div>
      </div>
    </div>
  );
}
