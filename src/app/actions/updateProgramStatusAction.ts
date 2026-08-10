'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

type Status = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type Result = { ok: true } | { ok: false; error: string };

export async function updateProgramStatusAction(programId: string, newStatus: Status): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Vous devez être connecté.' };
  if (session.role !== 'coach' && session.role !== 'admin') {
    return { ok: false, error: 'Accès refusé.' };
  }

  try {
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: { id: true, coachId: true, status: true, learningOutcomes: true },
    });
    if (!program) return { ok: false, error: 'Programme introuvable.' };

    if (session.role === 'coach') {
      const dbUser = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
      if (!dbUser || program.coachId !== dbUser.id) {
        return { ok: false, error: 'Vous ne pouvez modifier que vos propres programmes.' };
      }
    }

    if (newStatus === 'PUBLISHED' && program.learningOutcomes.length === 0) {
      return { ok: false, error: 'Ajoutez au moins un objectif pédagogique avant de publier.' };
    }

    await prisma.program.update({ where: { id: programId }, data: { status: newStatus } });

    revalidatePath('/programs');
    revalidatePath('/coach/programs');
    revalidatePath(`/coach/programs/${programId}`);
    return { ok: true };
  } catch (err) {
    console.error('[updateProgramStatusAction]', err);
    return { ok: false, error: 'Une erreur est survenue.' };
  }
}
