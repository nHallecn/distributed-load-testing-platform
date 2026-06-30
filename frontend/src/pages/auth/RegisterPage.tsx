import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../../auth/useAuth';
import { AuthLayout } from '../../layouts/AuthLayout';
import { ApiError } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { ErrorNotice } from '../../components/ui/ErrorNotice';

const schema = z
  .object({
    email: z.email('Enter a valid email address'),
    password: z
      .string()
      .min(12, 'Use at least 12 characters')
      .max(128, 'Password is too long'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register: createAccount, user } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  if (user) return <Navigate to="/app" replace />;

  const submit = async (values: FormValues) => {
    setServerError(null);
    try {
      await createAccount(values.email, values.password);
      await navigate('/app', { replace: true });
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Unable to create your account.',
      );
    }
  };

  return (
    <AuthLayout>
      <p className="eyebrow mb-3">Create your workspace</p>
      <h2 className="text-3xl font-[780] tracking-[-0.045em] text-ink-950">
        Start testing with intent
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Set up a secure operator account. Every target must be verified before
        traffic can run.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => void handleSubmit(submit)(event)}
      >
        {serverError ? <ErrorNotice message={serverError} /> : null}
        <div>
          <label className="label" htmlFor="email">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className="field !pl-10"
              {...register('email')}
            />
          </div>
          {errors.email ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        {(['password', 'confirmPassword'] as const).map((name) => (
          <div key={name}>
            <label className="label" htmlFor={name}>
              {name === 'password' ? 'Password' : 'Confirm password'}
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                id={name}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={
                  name === 'password'
                    ? 'At least 12 characters'
                    : 'Repeat your password'
                }
                className="field !px-10"
                {...register(name)}
              />
              {name === 'password' ? (
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              ) : null}
            </div>
            {errors[name] ? (
              <p className="mt-1.5 text-xs text-red-600">
                {errors[name]?.message}
              </p>
            ) : null}
          </div>
        ))}

        <div className="flex gap-3 rounded-xl bg-signal-50 px-4 py-3 text-xs leading-5 text-signal-600">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          LoadGrid enforces verified targets, account limits, and private-network
          blocking on every test.
        </div>

        <Button
          type="submit"
          loading={isSubmitting}
          className="!mt-6 w-full"
        >
          Create secure account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link className="font-bold text-signal-600 hover:text-signal-500" to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
