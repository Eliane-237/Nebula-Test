import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getCoachProgramDetail } from '@/app/actions/coachQueries';
import EditProgramForm from './EditProgramForm';

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'coach' && session.role !== 'admin')) {
    redirect('/login');
  }

  const { id: programId } = await params;
  const { data: program } = await getCoachProgramDetail(programId);

  if (!program) redirect('/coach/programs');

  return (
    <EditProgramForm
      programId={program.id}
      initial={{
        title:            program.title,
        description:      program.description,
        domain:           program.domain,
        difficulty:       program.difficulty,
        targetAudience:   program.targetAudience ?? '',
        numSessions:      program.numSessions,
        recommendedSize:  program.recommendedSize,
        maxCohortSize:    program.maxCohortSize,
        learningOutcomes: program.learningOutcomes,
      }}
    />
  );
}
