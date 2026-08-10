import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getCoachProgramDetail } from '@/app/actions/coachQueries';
import CoachProgramDetailView from './CoachProgramDetailView';

export default async function CoachProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'coach' && session.role !== 'admin')) {
    redirect('/login');
  }

  const { id: programId } = await params;
  const { data: program } = await getCoachProgramDetail(programId);

  if (!program) redirect('/coach/programs');

  return <CoachProgramDetailView program={program} />;
}
