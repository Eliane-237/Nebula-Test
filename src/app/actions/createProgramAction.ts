'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export type CreateProgramInput = {
  title: string;
  description: string;
  domain: string;
  targetAudience?: string;
  difficulty: string;
  sessionCount: number;
  recommendedSize: number;
  maxCohortSize: number;
  learningOutcomes: string[];
};

type Result = { ok: true; id: string } | { ok: false; error: string };

// Map from UI string → Prisma enum
const DOMAIN_MAP: Record<string, string> = {
  Finance: 'FINANCE', Consulting: 'CONSULTING', Data: 'DATA',
  Product: 'PRODUCT', 'Software Engineering': 'SOFTWARE_ENGINEERING',
  Marketing: 'MARKETING', Entrepreneurship: 'ENTREPRENEURSHIP',
};
const DIFF_MAP: Record<string, string> = {
  Beginner: 'BEGINNER', Intermediate: 'INTERMEDIATE', Advanced: 'ADVANCED',
};

export async function createProgramAction(input: CreateProgramInput): Promise<Result> {
  // ── Auth + role guard ──────────────────────────────────────────────────
  const session = await getSession();
  if (!session) return { ok: false, error: 'Vous devez être connecté.' };
  if (session.role !== 'coach' && session.role !== 'admin') {
    return { ok: false, error: 'Seuls les coachs peuvent créer un programme.' };
  }

  // ── Business rule: 2 ≤ numSessions ≤ 4 ────────────────────────────────
  if (input.sessionCount < 2 || input.sessionCount > 4) {
    return { ok: false, error: 'Un programme doit contenir entre 2 et 4 sessions.' };
  }

  // ── Business rule: maxCohortSize ≤ 20 ─────────────────────────────────
  if (input.maxCohortSize < 1 || input.maxCohortSize > 20) {
    return { ok: false, error: 'La capacité maximale doit être comprise entre 1 et 20 participants.' };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.email },
      select: { id: true },
    });
    if (!dbUser) return { ok: false, error: 'Profil coach introuvable.' };

    const program = await prisma.program.create({
      data: {
        title:           input.title,
        description:     input.description,
        domain:          (DOMAIN_MAP[input.domain] ?? 'FINANCE') as never,
        targetAudience:  input.targetAudience,
        difficulty:      (DIFF_MAP[input.difficulty] ?? 'INTERMEDIATE') as never,
        numSessions:     input.sessionCount,
        recommendedSize: input.recommendedSize,
        maxCohortSize:   input.maxCohortSize,
        learningOutcomes: input.learningOutcomes.filter(Boolean),
        status:          'DRAFT',
        coachId:         dbUser.id,
      },
    });

    return { ok: true, id: program.id };
  } catch (err) {
    console.error('[createProgramAction]', err);
    return { ok: false, error: 'Une erreur est survenue. Veuillez réessayer.' };
  }
}
