import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Braces, Gauge, Save, ShieldAlert } from 'lucide-react';
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { ErrorNotice } from '../../components/ui/ErrorNotice';
import { api, ApiError } from '../../lib/api';
import type { CreateLoadTestInput } from '../../lib/types';

const optionalPositiveNumber = z.number().positive().optional();

const schema = z
  .object({
    name: z.string().trim().min(3, 'Use at least 3 characters').max(120),
    targetUrl: z.url('Enter an absolute HTTP or HTTPS URL'),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
    virtualUsers: z.number().int().min(1).max(10_000),
    durationSeconds: z.number().int().min(1).max(3_600),
    rampUpSeconds: z.number().int().min(0),
    expectedResponseTimeMs: optionalPositiveNumber,
    maxErrorRatePercent: z.number().min(0).max(100).optional(),
    maxP95LatencyMs: optionalPositiveNumber,
    headersJson: z
      .string()
      .refine((value) => isJsonObject(value), 'Headers must be a JSON object'),
    bodyJson: z
      .string()
      .refine(
        (value) => value.trim() === '' || isJson(value),
        'Body must be valid JSON',
      ),
  })
  .refine((values) => values.rampUpSeconds <= values.durationSeconds, {
    path: ['rampUpSeconds'],
    message: 'Ramp-up cannot exceed the total duration',
  });

type FormValues = z.infer<typeof schema>;

function isJson(value: string): boolean {
  try {
    parseJson(value);
    return true;
  } catch {
    return false;
  }
}

function isJsonObject(value: string): boolean {
  try {
    return isStringRecord(parseJson(value));
  } catch {
    return false;
  }
}

function parseJson(value: string): unknown {
  return JSON.parse(value) as unknown;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}

export function NewTestPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      targetUrl: '',
      method: 'GET',
      virtualUsers: 100,
      durationSeconds: 60,
      rampUpSeconds: 10,
      headersJson: '{\n  "Accept": "application/json"\n}',
      bodyJson: '',
    },
  });
  const method = useWatch({ control, name: 'method' });
  const virtualUsers = useWatch({ control, name: 'virtualUsers' });

  const create = useMutation({
    mutationFn: (input: CreateLoadTestInput) => api.createTest(input),
    onSuccess: async (test) => {
      await queryClient.invalidateQueries({ queryKey: ['tests'] });
      await navigate(`/app/tests/${test.id}`);
    },
  });

  const submit = (values: FormValues) => {
    const parsedHeaders = parseJson(values.headersJson);
    if (!isStringRecord(parsedHeaders)) return;
    const body = values.bodyJson.trim()
      ? parseJson(values.bodyJson)
      : undefined;
    create.mutate({
      name: values.name,
      targetUrl: values.targetUrl,
      method: values.method,
      virtualUsers: values.virtualUsers,
      durationSeconds: values.durationSeconds,
      rampUpSeconds: values.rampUpSeconds,
      expectedResponseTimeMs: values.expectedResponseTimeMs,
      headers: parsedHeaders,
      body,
      stopConditions: {
        maxErrorRatePercent: values.maxErrorRatePercent,
        maxP95LatencyMs: values.maxP95LatencyMs,
      },
    });
  };

  const fieldError = (message?: string) =>
    message ? <p className="mt-1.5 text-xs text-red-600">{message}</p> : null;

  const bodyAllowed = !['GET', 'HEAD'].includes(method);

  return (
    <>
      <Link
        to="/app/tests"
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-ink-950"
      >
        <ArrowLeft className="size-3.5" />
        Back to tests
      </Link>

      <div className="mb-7 max-w-2xl">
        <p className="eyebrow mb-2">New traffic profile</p>
        <h1 className="text-2xl font-[780] tracking-[-0.04em] text-ink-950 sm:text-[2rem]">
          Define the load, then protect the target.
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Profiles are reusable. The target hostname must already have a valid
          ownership verification before this configuration can be saved.
        </p>
      </div>

      {create.isError ? (
        <div className="mb-5 max-w-3xl">
          <ErrorNotice
            message={
              create.error instanceof ApiError
                ? create.error.message
                : 'Unable to create the test.'
            }
          />
          {create.error instanceof ApiError &&
          create.error.message.toLowerCase().includes('verify') ? (
            <Link
              to="/app/targets"
              className="mt-3 inline-flex text-xs font-bold text-signal-600 hover:text-signal-500"
            >
              Open target verification →
            </Link>
          ) : null}
        </div>
      ) : null}

      <form
        className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"
        onSubmit={(event) => void handleSubmit(submit)(event)}
      >
        <div className="space-y-6">
          <section className="panel p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <Gauge className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-ink-950">Request and load</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Target, concurrency, and timing
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="name">
                  Profile name
                </label>
                <input
                  id="name"
                  className="field"
                  placeholder="Checkout API baseline"
                  {...register('name')}
                />
                {fieldError(errors.name?.message)}
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="targetUrl">
                  Target URL
                </label>
                <div className="flex">
                  <select
                    aria-label="HTTP method"
                    className="field !w-[112px] !rounded-r-none !border-r-0 font-bold text-violet-600"
                    {...register('method')}
                  >
                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map(
                      (value) => (
                        <option value={value} key={value}>
                          {value}
                        </option>
                      ),
                    )}
                  </select>
                  <input
                    id="targetUrl"
                    type="url"
                    className="field !rounded-l-none"
                    placeholder="https://api.example.com/v1/checkout"
                    {...register('targetUrl')}
                  />
                </div>
                {fieldError(errors.targetUrl?.message)}
              </div>
              <NumberField
                id="virtualUsers"
                label="Virtual users"
                suffix="users"
                register={register('virtualUsers', { valueAsNumber: true })}
                error={errors.virtualUsers?.message}
              />
              <NumberField
                id="durationSeconds"
                label="Duration"
                suffix="seconds"
                register={register('durationSeconds', { valueAsNumber: true })}
                error={errors.durationSeconds?.message}
              />
              <NumberField
                id="rampUpSeconds"
                label="Ramp-up"
                suffix="seconds"
                register={register('rampUpSeconds', { valueAsNumber: true })}
                error={errors.rampUpSeconds?.message}
              />
              <NumberField
                id="expectedResponseTimeMs"
                label="Expected response"
                suffix="ms"
                placeholder="Optional"
                register={register('expectedResponseTimeMs', {
                  setValueAs: (value: string) =>
                    value === '' ? undefined : Number(value),
                })}
                error={errors.expectedResponseTimeMs?.message}
              />
            </div>
          </section>

          <section className="panel p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
                <Braces className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-ink-950">Request data</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  JSON headers and optional body
                </p>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="headersJson">
                Headers
              </label>
              <textarea
                id="headersJson"
                rows={6}
                spellCheck={false}
                className="field font-mono text-xs"
                {...register('headersJson')}
              />
              {fieldError(errors.headersJson?.message)}
            </div>
            <div className="mt-5">
              <label className="label" htmlFor="bodyJson">
                Request body
              </label>
              <textarea
                id="bodyJson"
                rows={7}
                spellCheck={false}
                disabled={!bodyAllowed}
                placeholder={
                  bodyAllowed
                    ? '{\n  "key": "value"\n}'
                    : `${method} requests do not include a body`
                }
                className="field font-mono text-xs disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                {...register('bodyJson')}
              />
              {fieldError(errors.bodyJson?.message)}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="panel p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <ShieldAlert className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-ink-950">Stop conditions</h2>
                <p className="mt-0.5 text-xs text-slate-400">Optional guardrails</p>
              </div>
            </div>
            <div className="mt-6 space-y-5">
              <NumberField
                id="maxErrorRatePercent"
                label="Maximum error rate"
                suffix="%"
                placeholder="Not set"
                register={register('maxErrorRatePercent', {
                  setValueAs: (value: string) =>
                    value === '' ? undefined : Number(value),
                })}
                error={errors.maxErrorRatePercent?.message}
              />
              <NumberField
                id="maxP95LatencyMs"
                label="Maximum p95 latency"
                suffix="ms"
                placeholder="Not set"
                register={register('maxP95LatencyMs', {
                  setValueAs: (value: string) =>
                    value === '' ? undefined : Number(value),
                })}
                error={errors.maxP95LatencyMs?.message}
              />
            </div>
            <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
              Crossing either threshold requests an immediate coordinated stop.
            </p>
          </section>

          <section className="rounded-2xl bg-ink-950 p-6 text-white shadow-panel">
            <p className="eyebrow text-signal-400">Capacity preview</p>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-3xl font-[780] tracking-[-0.045em]">
                  {Math.ceil((virtualUsers || 0) / 500)}
                </p>
                <p className="mt-1 text-xs text-slate-500">worker partitions</p>
              </div>
              <p className="text-xs font-semibold text-slate-400">
                500 users / worker
              </p>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-signal-400"
                style={{
                  width: `${Math.max(4, Math.min(100, ((virtualUsers || 0) / 10_000) * 100))}%`,
                }}
              />
            </div>
          </section>

          <Button
            type="submit"
            loading={create.isPending}
            icon={<Save className="size-4" />}
            className="w-full"
          >
            Save test profile
          </Button>
        </aside>
      </form>
    </>
  );
}

interface NumberFieldProps {
  id: string;
  label: string;
  suffix: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
}

function NumberField({
  id,
  label,
  suffix,
  placeholder,
  register: registration,
  error,
}: NumberFieldProps) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          min={0}
          placeholder={placeholder}
          className="field !pr-20"
          {...registration}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.68rem] font-bold text-slate-400">
          {suffix}
        </span>
      </div>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
