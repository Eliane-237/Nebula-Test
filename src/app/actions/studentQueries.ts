'use server';

import { prisma } from '@/lib/prisma';

export async function getStudentEnrollments(userId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        cohort: {
          include: {
            program: {
              include: {
                coach: { select: { name: true } },
                explorations: {
                  include: {
                    responses: { where: { userId } },
                  },
                },
              },
            },
            sessions: { orderBy: { order: 'asc' } },
            _count: { select: { enrollments: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
    return { data: enrollments, error: null };
  } catch (err) {
    console.error('[getStudentEnrollments]', err);
    return { data: [], error: 'Failed to load your programs.' };
  }
}

export async function getStudentUpcomingSessions(userId: string) {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        dateTime: { gte: new Date() },
        cohort: { enrollments: { some: { userId } } },
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
