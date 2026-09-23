import { AppShell } from '@/layouts/AppShell';

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
