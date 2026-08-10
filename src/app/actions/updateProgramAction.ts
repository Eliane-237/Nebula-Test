'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

type UpdateProgramInput = {
  programId:        string;
  title:            string;
  description:      string;
  domain:           string;
  difficulty:       string;
  targetAudience?:  string;
  numSessions:      number;
  recommendedSize:  number;
  maxCohortSize:    number;
  learningOutcomes: string[];
};

type Result = { ok: true } | { ok: false; error: string };

const DOMAIN_MAP: Record<string, string> = {
  'Finance': 'FINANCE', 'Data': 'DATA', 'Product': 'PRODUCT',
  'Software Engineering': 'SOFTWARE_ENGINEERING', 'Consulting': 'CONSULTING',
  'Marketing': 'MARKETING', 'Entrepreneurship': 'ENTREPRENEURSHIP',
};

const DIFFICULTY_MAP: Record<string, string> = {
  'Débutant': 'BEGINNER', 'Intermédiaire': 'INTERMEDIATE', 'Avancé': 'ADVANCED',
};

export async function updateProgramAction(input: UpdateProgramInput): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Vous devez être connecté.' };
  if (session.role !== 'coach' && session.role !== 'admin') {
    return { ok: false, error: 'Accès refusé.' };
  }

  const { programId, title, description, domain, difficulty, targetAudience, numSessions, recommendedSize, maxCohortSize, learningOutcomes } = input;

  if (!title.trim()) return { ok: false, error: 'Le titre est obligatoire.' };
  if (!description.trim()) return { ok: false, error: 'La description est obligatoire.' };
  if (numSessions < 2 || numSessions > 4) return { ok: false, error: 'Le nombre de sessions doit être entre 2 et 4.' };
  if (maxCohortSize < 1 || maxCohortSize > 20) return { ok: false, error: 'La capacité maximale doit être entre 1 et 20.' };

  try {
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: { id: true, coachId: true },
    });
    if (!program) return { ok: false, error: 'Programme introuvable.' };

    if (session.role === 'coach') {
      const dbUser = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
      if (!dbUser || program.coachId !== dbUser.id) {
        return { ok: false, error: 'Vous ne pouvez modifier que vos propres programmes.' };
      }
    }

    const domainEnum  = (DOMAIN_MAP[domain] ?? domain) as Parameters<typeof prisma.program.update>[0]['data']['domain'];
    const diffEnum    = (DIFFICULTY_MAP[difficulty] ?? difficulty) as Parameters<typeof prisma.program.update>[0]['data']['difficulty'];

    await prisma.program.update({
      where: { id: programId },
      data: {
        title:            title.trim(),
        description:      description.trim(),
        domain:           domainEnum,
        difficulty:       diffEnum,
        targetAudience:   targetAudience?.trim() || null,
        numSessions,
        recommendedSize,
        maxCohortSize,
        learningOutcomes: learningOutcomes.filter(Boolean),
      },
    });

    revalidatePath('/programs');
    revalidatePath('/coach/programs');
    revalidatePath(`/coach/programs/${programId}`);
    return { ok: true };
  } catch (err) {
    console.error('[updateProgramAction]', err);
    return { ok: false, error: 'Une erreur est survenue.' };
  }
}
