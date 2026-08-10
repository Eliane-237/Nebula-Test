import { getSession } from '@/lib/session';
import { getStudentEnrollments } from '@/app/actions/studentQueries';
import { MyProgramsView } from './MyProgramsView';

export default async function MyProgramsPage() {
  const session = await getSession();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let enrollments: any[] = [];

  if (session?.email) {
    const { prisma } = await import('@/lib/prisma');
    const dbUser = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
    if (dbUser) {
      const result = await getStudentEnrollments(dbUser.id);
      enrollments = result.data;
    }
  }

  return <MyProgramsView enrollments={enrollments} />;
}
