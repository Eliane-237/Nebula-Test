import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import CohortCreateForm from '@/app/(app)/coach/cohorts/[id]/CohortCreateForm';

const DOMAIN_COLOR: Record<string, string> = {
  FINANCE: '#146138', DATA: '#0E7C86', PRODUCT: '#2D5FB8',
  SOFTWARE_ENGINEERING: '#4A3FA6', CONSULTING: '#B8752D',
  MARKETING: '#B23B6B', ENTREPRENEURSHIP: '#7a5c38',
};

export default async function NewCohortPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'coach' && session.role !== 'admin')) {
    redirect('/login');
  }

  const { id: programId } = await params;
  const { prisma } = await import('@/lib/prisma');

  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { id: true, title: true, domain: true, numSessions: true },
  }).catch(() => null);

  if (!program) redirect('/coach/programs');

  const color = DOMAIN_COLOR[program.domain] ?? '#426f8d';

  const defaultSessions = Array.from({ length: program.numSessions }, (_, i) => ({
    title: `Session ${i + 1}`,
    date: '',
  }));

  return (
    <CohortCreateForm
      programId={program.id}
      programTitle={program.title}
      color={color}
      sessions={defaultSessions}
      backUrl={`/coach/programs/${program.id}`}
    />
  );
}
