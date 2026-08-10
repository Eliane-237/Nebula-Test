'use server';

import { prisma } from '@/lib/prisma';

export async function getCoachPrograms(coachId: string) {
  try {
    const programs = await prisma.program.findMany({
      where: { coachId },
      include: {
        _count: { select: { cohorts: true } },
        cohorts: { select: { _count: { select: { enrollments: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const data = programs.map((p) => ({
      id:            p.id,
      title:         p.title,
      description:   p.description,
      domain:        p.domain,
      difficulty:    p.difficulty,
      numSessions:   p.numSessions,
      maxCohortSize: p.maxCohortSize,
      status:        p.status,
      cohortCount:   p._count.cohorts,
      totalEnrolled: p.cohorts.reduce((sum, c) => sum + c._count.enrollments, 0),
    }));
    return { data, error: null };
  } catch (err) {
    console.error('[getCoachPrograms]', err);
    return { data: [], error: 'Failed to load programs.' };
  }
}

export async function getCoachProgramDetail(programId: string) {
  try {
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        cohorts: {
          include: {
            sessions:  { orderBy: { order: 'asc' } },
            _count:    { select: { enrollments: true } },
          },
          orderBy: { startDate: 'asc' },
        },
        explorations: {
          include: {
            responses: {
              include: { user: { select: { id: true, name: true, email: true } } },
              orderBy: { submittedAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return { data: program, error: null };
  } catch (err) {
    console.error('[getCoachProgramDetail]', err);
    return { data: null, error: 'Failed to load program.' };
  }
}

export async function getCoachUpcomingSessions(coachId: string) {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        dateTime: { gte: new Date() },
        cohort: { program: { coachId } },
      },
      include: {
        cohort: { include: { program: { select: { title: true } } } },
      },
      orderBy: { dateTime: 'asc' },
      take: 5,
    });
    return sessions;
  } catch {
    return [];
  }
}

export async function getCohortDetail(cohortId: string) {
  try {
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        program:     { select: { id: true, title: true, numSessions: true } },
        sessions:    { orderBy: { order: 'asc' } },
        enrollments: {
          include:  { user: { select: { id: true, name: true, email: true } } },
          orderBy:  { enrolledAt: 'asc' },
        },
      },
    });
    return { data: cohort, error: null };
  } catch (err) {
    console.error('[getCohortDetail]', err);
    return { data: null, error: 'Failed to load cohort.' };
  }
}
