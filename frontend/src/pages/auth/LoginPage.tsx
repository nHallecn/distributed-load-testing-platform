import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../../auth/useAuth';
import { AuthLayout } from '../../layouts/AuthLayout';
import { ApiError } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { ErrorNotice } from '../../components/ui/ErrorNotice';

const schema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  if (user) return <Navigate to="/app" replace />;

  const submit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      const state = location.state as { from?: string } | null;
      await navigate(state?.from ?? '/app', { replace: true });
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : 'Unable to sign in.',
      );
    }
  };

  return (
    <AuthLayout>
      <p className="eyebrow mb-3">Welcome back</p>
      <h2 className="text-3xl font-[780] tracking-[-0.045em] text-ink-950">
        Sign in to your workspace
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Continue monitoring your test infrastructure and recent runs.
      </p>

      <form
        className="mt-9 space-y-5"
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
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </div>
          {errors.email ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="label !mb-0" htmlFor="password">
              Password
            </label>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="field !px-10"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
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
          </div>
        </div>

        <Button
          type="submit"
          loading={isSubmitting}
          className="!mt-7 w-full"
        >
          Sign in
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        New to LoadGrid?{' '}
        <Link className="font-bold text-signal-600 hover:text-signal-500" to="/register">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
