'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

type Result = { ok: true } | { ok: false; error: string };

export async function publishProgramAction(programId: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Vous devez être connecté.' };
  if (session.role !== 'coach' && session.role !== 'admin') {
    return { ok: false, error: 'Seuls les coachs peuvent publier un programme.' };
  }

  try {
    const program = await prisma.program.findUnique({
      where:  { id: programId },
      select: { id: true, coachId: true, status: true, numSessions: true, learningOutcomes: true },
    });
    if (!program) return { ok: false, error: 'Programme introuvable.' };

    // Coaches can only publish their own programs
    if (session.role === 'coach') {
      const dbUser = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
      if (!dbUser || program.coachId !== dbUser.id) {
        return { ok: false, error: 'Vous ne pouvez publier que vos propres programmes.' };
      }
    }

    if (program.status === 'ARCHIVED') {
      return { ok: false, error: 'Un programme archivé ne peut pas être publié.' };
    }

    // Business rule: a program must have at least one learning outcome before publishing
    if (program.learningOutcomes.length === 0) {
      return { ok: false, error: 'Le programme doit avoir au moins un objectif pédagogique avant d\'être publié.' };
    }

    await prisma.program.update({
      where: { id: programId },
      data:  { status: 'PUBLISHED' },
    });

    revalidatePath('/programs');
    revalidatePath('/coach/programs');
    return { ok: true };
  } catch (err) {
    console.error('[publishProgramAction]', err);
    return { ok: false, error: 'Une erreur est survenue. Veuillez réessayer.' };
  }
}
