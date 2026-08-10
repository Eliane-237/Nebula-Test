import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getCohortDetail } from '@/app/actions/coachQueries';
import CohortManageView from './CohortManageView';

export default async function CohortManagePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'coach' && session.role !== 'admin')) {
    redirect('/login');
  }

  const { id: cohortId } = await params;
  const { data: cohort } = await getCohortDetail(cohortId);

  if (!cohort) redirect('/coach/programs');

  return <CohortManageView cohort={cohort} />;
}
