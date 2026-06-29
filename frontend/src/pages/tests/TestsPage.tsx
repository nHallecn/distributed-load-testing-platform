import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FlaskConical, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  formatCompactNumber,
  formatDate,
  formatDuration,
} from '../../lib/format';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorNotice } from '../../components/ui/ErrorNotice';
import { LoadingPanel } from '../../components/ui/LoadingPanel';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function TestsPage() {
  const tests = useQuery({ queryKey: ['tests'], queryFn: api.listTests });

  return (
    <>
      <PageHeader
        eyebrow="Traffic profiles"
        title="Load tests"
        description="Reusable, versioned request profiles for targets you are authorized to test."
        actions={
          <ButtonLink to="/app/tests/new" icon={<Plus className="size-4" />}>
            New test
          </ButtonLink>
        }
      />

      {tests.isLoading ? <LoadingPanel /> : null}
      {tests.isError ? <ErrorNotice message={tests.error.message} /> : null}
      {tests.data?.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="Create your first test profile"
          description="Define a method, target, virtual users, ramp-up, duration, and safety thresholds."
          action={
            <ButtonLink to="/app/tests/new">Build a profile</ButtonLink>
          }
        />
      ) : null}

      {tests.data?.length ? (
        <div className="panel overflow-hidden">
          <div className="hidden grid-cols-[minmax(260px,1fr)_110px_110px_120px_36px] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-[0.65rem] font-extrabold uppercase tracking-wider text-slate-400 md:grid">
            <span>Profile</span>
            <span>Users</span>
            <span>Duration</span>
            <span>Status</span>
            <span />
          </div>
          {tests.data.map((test) => (
            <Link
              key={test.id}
              to={`/app/tests/${test.id}`}
              className="group grid gap-4 border-b border-slate-100 px-5 py-5 last:border-0 hover:bg-slate-50/60 md:grid-cols-[minmax(260px,1fr)_110px_110px_120px_36px] md:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-950">
                  {test.name}
                </p>
                <p className="mt-1.5 truncate text-xs text-slate-400">
                  <span className="mr-1.5 font-extrabold text-violet-600">
                    {test.method}
                  </span>
                  {test.targetUrl}
                </p>
                <p className="mt-2 text-[0.65rem] text-slate-400 md:hidden">
                  Created {formatDate(test.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {formatCompactNumber(test.virtualUsers)}
                </p>
                <p className="mt-0.5 text-[0.65rem] text-slate-400 md:hidden">
                  virtual users
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-600">
                {formatDuration(test.durationSeconds)}
              </p>
              <div>
                <StatusBadge status={test.status} />
              </div>
              <ArrowRight className="hidden size-4 text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-600 md:block" />
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}
