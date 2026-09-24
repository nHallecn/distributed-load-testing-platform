import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('presents the product and sends visitors directly to test creation', () => {
    render(<LandingPage />);

    expect(
      screen.getByRole('heading', { name: /know what breaks before it does/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/free to use\. no signup/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /test your system/i }),
    ).toHaveAttribute('href', '/app/tests/new');
    expect(
      screen.getByRole('link', { name: /view the workspace/i }),
    ).toHaveAttribute('href', '/app');
  });
});
