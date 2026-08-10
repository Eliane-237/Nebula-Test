import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getAdminStats } from '@/app/actions/adminQueries';
import { getCoachPrograms, getCoachUpcomingSessions } from '@/app/actions/coachQueries';
import { getStudentEnrollments, getStudentUpcomingSessions } from '@/app/actions/studentQueries';
import AdminDashboard from './AdminDashboard';
import CoachDashboard from './CoachDashboard';
import StudentDashboard from './StudentDashboard';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const { prisma } = await import('@/lib/prisma');
  const dbUser = await prisma.user
    .findUnique({ where: { email: session.email }, select: { id: true } })
    .catch(() => null);

  if (!dbUser) redirect('/login');

  if (session.role === 'admin') {
    const { data } = await getAdminStats();
    return <AdminDashboard stats={data} name={session.name} />;
  }

  if (session.role === 'coach') {
    const [{ data: programs }, sessions] = await Promise.all([
      getCoachPrograms(dbUser.id),
      getCoachUpcomingSessions(dbUser.id),
    ]);
    return (
      <CoachDashboard
        name={session.name}
        programs={programs ?? []}
        sessions={sessions}
      />
    );
  }

  // Student
  const [{ data: enrollments }, upcomingSessions] = await Promise.all([
    getStudentEnrollments(dbUser.id),
    getStudentUpcomingSessions(dbUser.id),
  ]);

  return (
    <StudentDashboard
      name={session.name}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enrollments={enrollments as any[]}
      upcomingSessions={upcomingSessions}
    />
  );
}
