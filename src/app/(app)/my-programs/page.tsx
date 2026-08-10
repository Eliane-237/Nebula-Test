import { getSession } from '@/lib/session';
import { getStudentEnrollments } from '@/app/actions/studentQueries';
import { MyProgramsView } from './MyProgramsView';
import { prisma } from '@/lib/prisma';

export default async function MyProgramsPage() {
  const session = await getSession();

  let enrollments: Awaited<ReturnType<typeof getStudentEnrollments>>['data'] = [];

  if (session?.email) {
    const dbUser = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
    if (dbUser) {
      const result = await getStudentEnrollments(dbUser.id);
      enrollments = result.data;
    }
  }

  return <MyProgramsView enrollments={enrollments} />;
}
