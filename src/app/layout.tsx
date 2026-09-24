import type { Metadata } from 'next';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'LoadGrid — Find the limit before users do',
  description:
    'Run distributed load tests, watch performance move in real time, and find bottlenecks before production traffic does.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
