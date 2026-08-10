import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { AppShell } from '@/components/AppShell';
import { UserProvider } from '@/lib/user-context';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect('/login');

  return (
    <UserProvider user={user}>
      <AppShell>{children}</AppShell>
    </UserProvider>
  );
}
