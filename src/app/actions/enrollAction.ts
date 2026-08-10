'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

type Result = { ok: true } | { ok: false; error: string };

export async function enrollAction(cohortId: string): Promise<Result> {
  // ── Auth guard ─────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session) return { ok: false, error: 'Vous devez être connecté pour vous inscrire.' };
  if (session.role !== 'student') {
    return { ok: false, error: 'Seuls les étudiants peuvent s\'inscrire à une cohorte.' };
  }

  try {
    // ── Load cohort with enrollment count ─────────────────────────────────
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!cohort) return { ok: false, error: 'Cohorte introuvable.' };

    // ── Business rule: cohort must be open ────────────────────────────────
    if (cohort.status !== 'OPEN') {
      return {
        ok: false,
        error:
          cohort.status === 'FULL'
            ? 'Cette cohorte est complète — plus aucune place disponible.'
            : 'Cette cohorte n\'accepte plus d\'inscriptions.',
      };
    }

    // ── Business rule: max capacity ───────────────────────────────────────
    if (cohort._count.enrollments >= cohort.maxParticipants) {
      await prisma.cohort.update({ where: { id: cohortId }, data: { status: 'FULL' } });
      return { ok: false, error: 'Cette cohorte vient d\'atteindre sa capacité maximale.' };
    }

    // ── Resolve the DB user ID by email (session holds a stable email) ────
    const dbUser = await prisma.user.findUnique({
      where: { email: session.email },
      select: { id: true },
    });
    if (!dbUser) return { ok: false, error: 'Profil utilisateur introuvable.' };

    // ── Business rule: no duplicate enrollment ────────────────────────────
    const duplicate = await prisma.enrollment.findUnique({
      where: { userId_cohortId: { userId: dbUser.id, cohortId } },
    });
    if (duplicate) return { ok: false, error: 'Vous êtes déjà inscrit à cette cohorte.' };

    // ── Create enrollment ─────────────────────────────────────────────────
    await prisma.enrollment.create({
      data: { userId: dbUser.id, cohortId },
    });

    // Auto-close cohort when it reaches capacity
    if (cohort._count.enrollments + 1 >= cohort.maxParticipants) {
      await prisma.cohort.update({ where: { id: cohortId }, data: { status: 'FULL' } });
    }

    revalidatePath('/programs');
    revalidatePath(`/programs/${cohort.programId}`);
    revalidatePath('/my-programs');
    return { ok: true };
  } catch (err) {
    console.error('[enrollAction]', err);
    return { ok: false, error: 'Une erreur est survenue. Veuillez réessayer.' };
  }
}
