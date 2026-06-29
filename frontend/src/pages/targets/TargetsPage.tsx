import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  Check,
  Clipboard,
  Globe2,
  KeyRound,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api, ApiError } from '../../lib/api';
import type { TargetVerification } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { ErrorNotice } from '../../components/ui/ErrorNotice';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

const schema = z.object({
  targetUrl: z.url('Enter an absolute HTTP or HTTPS URL'),
  method: z.enum(['dns_txt', 'http_file']),
});

type FormValues = z.infer<typeof schema>;

export function TargetsPage() {
  const [challenge, setChallenge] = useState<TargetVerification | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { targetUrl: '', method: 'dns_txt' },
  });

  const create = useMutation({
    mutationFn: (values: FormValues) =>
      api.createVerification(values.targetUrl, values.method),
    onSuccess: setChallenge,
  });
  const verify = useMutation({
    mutationFn: () => api.verifyTarget(challenge?.id ?? ''),
    onSuccess: setChallenge,
  });

  const copy = async (label: string, value?: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1_600);
  };

  const error = create.error ?? verify.error;

  return (
    <>
      <PageHeader
        eyebrow="Safety boundary"
        title="Target access"
        description="Prove control of a hostname before any distributed traffic can be dispatched to it."
      />

      {error ? (
        <div className="mb-5 max-w-3xl">
          <ErrorNotice
            message={
              error instanceof ApiError
                ? error.message
                : 'Verification could not be completed.'
            }
          />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.78fr)]">
        <section className="panel p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-signal-50 text-signal-600">
              <Globe2 className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink-950">
                Request ownership challenge
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Challenges expire after 24 hours
              </p>
            </div>
          </div>

          <form
            className="mt-7 space-y-5"
            onSubmit={(event) => void handleSubmit((values) => create.mutate(values))(event)}
          >
            <div>
              <label className="label" htmlFor="targetUrl">
                Target URL
              </label>
              <input
                id="targetUrl"
                type="url"
                className="field"
                placeholder="https://api.your-company.com"
                {...register('targetUrl')}
              />
              {errors.targetUrl ? (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.targetUrl.message}
                </p>
              ) : null}
            </div>

            <fieldset>
              <legend className="label">Verification method</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: 'dns_txt',
                    title: 'DNS TXT record',
                    note: 'Best for domains and APIs',
                  },
                  {
                    value: 'http_file',
                    title: 'HTTPS file',
                    note: 'Serve a well-known token',
                  },
                ].map((option) => (
                  <label
                    className="has-[:checked]:border-signal-400 has-[:checked]:bg-signal-50 cursor-pointer rounded-xl border border-slate-200 p-4"
                    key={option.value}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      className="sr-only"
                      {...register('method')}
                    />
                    <span className="text-sm font-bold text-slate-700">
                      {option.title}
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {option.note}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Button
              type="submit"
              loading={create.isPending}
              icon={<KeyRound className="size-4" />}
            >
              Generate challenge
            </Button>
          </form>

          {challenge ? (
            <div className="mt-8 border-t border-slate-100 pt-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink-950">
                    Challenge for {challenge.hostname}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Publish these exact values, then check ownership.
                  </p>
                </div>
                <StatusBadge status={challenge.status} />
              </div>

              <div className="mt-5 space-y-3">
                {challenge.method === 'dns_txt' ? (
                  <>
                    <CopyRow
                      label="Record name"
                      value={challenge.instructions.name}
                      copied={copied}
                      onCopy={copy}
                    />
                    <CopyRow
                      label="TXT value"
                      value={challenge.instructions.value}
                      copied={copied}
                      onCopy={copy}
                    />
                  </>
                ) : (
                  <>
                    <CopyRow
                      label="File URL"
                      value={challenge.instructions.url}
                      copied={copied}
                      onCopy={copy}
                    />
                    <CopyRow
                      label="File body"
                      value={challenge.instructions.body}
                      copied={copied}
                      onCopy={copy}
                    />
                  </>
                )}
              </div>

              <Button
                className="mt-5"
                variant={challenge.status === 'verified' ? 'secondary' : 'primary'}
                loading={verify.isPending}
                disabled={challenge.status === 'verified'}
                icon={
                  challenge.status === 'verified' ? (
                    <Check className="size-4" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )
                }
                onClick={() => verify.mutate()}
              >
                {challenge.status === 'verified'
                  ? 'Ownership verified'
                  : 'Check ownership'}
              </Button>
            </div>
          ) : null}
        </section>

        <aside className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-6 text-white shadow-panel">
            <div className="grid-lines absolute inset-0 opacity-40" />
            <div className="relative">
              <ShieldCheck className="size-6 text-signal-400" />
              <h2 className="mt-5 text-lg font-bold tracking-tight">
                Verification is deliberately strict.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                A verified hostname does not bypass network protections.
                Loopback, private, link-local, metadata, and reserved addresses
                remain blocked.
              </p>
            </div>
          </div>

          <div className="panel p-6">
            <p className="eyebrow">Before you verify</p>
            <ul className="mt-5 space-y-4">
              {[
                'Use a hostname you own or are explicitly authorized to test.',
                'Allow DNS propagation before checking a TXT challenge.',
                'Serve HTTPS file challenges without redirects.',
                'Create a new challenge when the current one expires.',
              ].map((item) => (
                <li className="flex gap-3 text-xs leading-5 text-slate-500" key={item}>
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-signal-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

interface CopyRowProps {
  label: string;
  value?: string;
  copied: string | null;
  onCopy: (label: string, value?: string) => Promise<void>;
}

function CopyRow({ label, value, copied, onCopy }: CopyRowProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[0.65rem] font-extrabold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <button
          type="button"
          className="flex items-center gap-1.5 text-[0.68rem] font-bold text-slate-500 hover:text-ink-950"
          onClick={() => void onCopy(label, value)}
        >
          {copied === label ? (
            <Check className="size-3.5 text-signal-600" />
          ) : (
            <Clipboard className="size-3.5" />
          )}
          {copied === label ? 'Copied' : 'Copy'}
        </button>
      </div>
      <code className="block break-all text-xs leading-5 text-slate-700">
        {value}
      </code>
    </div>
  );
}
