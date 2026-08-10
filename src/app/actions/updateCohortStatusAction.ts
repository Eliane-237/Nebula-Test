'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

type CohortStatus = 'OPEN' | 'CLOSED' | 'FULL';
type Result = { ok: true } | { ok: false; error: string };

export async function updateCohortStatusAction(cohortId: string, status: CohortStatus): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Vous devez être connecté.' };
  if (session.role !== 'coach' && session.role !== 'admin') {
    return { ok: false, error: 'Accès refusé.' };
  }

  try {
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { id: true, program: { select: { coachId: true, id: true } } },
    });
    if (!cohort) return { ok: false, error: 'Cohorte introuvable.' };

    if (session.role === 'coach') {
      const dbUser = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
      if (!dbUser || cohort.program.coachId !== dbUser.id) {
        return { ok: false, error: 'Vous ne pouvez modifier que vos propres cohortes.' };
      }
    }

    await prisma.cohort.update({ where: { id: cohortId }, data: { status } });

    revalidatePath(`/coach/cohorts/${cohortId}`);
    revalidatePath(`/coach/programs/${cohort.program.id}`);
    return { ok: true };
  } catch (err) {
    console.error('[updateCohortStatusAction]', err);
    return { ok: false, error: 'Une erreur est survenue.' };
  }
}
