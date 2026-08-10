'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

type SessionDraft = { title: string; description?: string; date: string };

type Input = {
  programId:       string;
  startDate:       string;
  endDate:         string;
  maxParticipants: number;
  sessions:        SessionDraft[];
  autoSchedule?:   boolean;
};

type Result = { ok: true } | { ok: false; error: string };

/** Distribute n dates uniformly between start and end (inclusive). */
function distributeSessionDates(start: Date, end: Date, n: number): Date[] {
  if (n === 1) return [new Date(start)];
  const span = end.getTime() - start.getTime();
  return Array.from(
    { length: n },
    (_, i) => new Date(start.getTime() + Math.round((span / (n - 1)) * i)),
  );
}

export async function createCohortAction(input: Input): Promise<Result> {
  // ── Auth + role guard ──────────────────────────────────────────────────
  const session = await getSession();
  if (!session) return { ok: false, error: 'Vous devez être connecté.' };
  if (session.role !== 'coach' && session.role !== 'admin') {
    return { ok: false, error: 'Seuls les coachs peuvent créer une cohorte.' };
  }

  // ── Business rule: capacity ────────────────────────────────────────────
  if (input.maxParticipants < 1 || input.maxParticipants > 20) {
    return { ok: false, error: 'La capacité doit être entre 1 et 20 participants.' };
  }

  const startDate = new Date(input.startDate);
  const endDate   = new Date(input.endDate);

  if (endDate <= startDate) {
    return { ok: false, error: 'La date de fin doit être postérieure à la date de début.' };
  }

  try {
    const program = await prisma.program.findUnique({
      where:  { id: input.programId },
      select: { id: true, numSessions: true },
    });
    if (!program) return { ok: false, error: 'Programme introuvable.' };

    // ── Business rule: numSessions must match program definition ──────────
    if (input.sessions.length !== program.numSessions) {
      return {
        ok: false,
        error: `Ce programme requiert exactement ${program.numSessions} sessions.`,
      };
    }

    // Resolve session dates (auto-schedule or manual)
    let sessions: { title: string; description?: string; date: Date }[];

    if (input.autoSchedule) {
      const dates = distributeSessionDates(startDate, endDate, program.numSessions);
      sessions = dates.map((date, i) => ({
        title:       input.sessions[i]?.title ?? `Session ${i + 1}`,
        description: input.sessions[i]?.description,
        date,
      }));
    } else {
      sessions = input.sessions.map((s) => ({
        title:       s.title,
        description: s.description,
        date:        new Date(s.date),
      }));
    }

    // ── Business rule: all session dates within cohort range ──────────────
    for (const s of sessions) {
      if (s.date < startDate || s.date > endDate) {
        return {
          ok: false,
          error: `La date de la session "${s.title}" est hors de la plage de la cohorte.`,
        };
      }
    }

    await prisma.cohort.create({
      data: {
        programId:      input.programId,
        startDate,
        endDate,
        maxParticipants: input.maxParticipants,
        status:          'OPEN',
        sessions: {
          create: sessions.map((s, i) => ({
            title:       s.title,
            description: s.description,
            dateTime:    s.date,
            duration:    45,
            order:       i + 1,
          })),
        },
      },
    });

    return { ok: true };
  } catch (err) {
    console.error('[createCohortAction]', err);
    return { ok: false, error: 'Une erreur est survenue. Veuillez réessayer.' };
  }
}
