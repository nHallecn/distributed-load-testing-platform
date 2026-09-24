import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
  });

  it('offers an immediate public test-creation path', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole('heading', { name: /see the pressure.*find the limit/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /create load test/i }),
    ).toHaveAttribute('href', '/app/tests/new');
    expect(await screen.findByText('No test profiles yet')).toBeInTheDocument();
  });
});
