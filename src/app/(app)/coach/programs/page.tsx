import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getCoachPrograms } from '@/app/actions/coachQueries';
import { CoachProgramsView } from './CoachProgramsView';

export default async function CoachProgramsPage() {
  const session = await getSession();
  if (!session || (session.role !== 'coach' && session.role !== 'admin')) {
    redirect('/login');
  }

  // Look up DB user by email to get real coach ID
  const { prisma } = await import('@/lib/prisma');
  const dbUser = await prisma.user.findUnique({
    where: { email: session.email },
    select: { id: true },
  }).catch(() => null);

  const { data: programs } = dbUser
    ? await getCoachPrograms(dbUser.id)
    : { data: [] };

  return (
    <CoachProgramsView
      coachName={session.name}
      programs={programs ?? []}
      coachId={dbUser?.id ?? ''}
    />
  );
}
