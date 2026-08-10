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
              include: { explorations: true },
            },
            sessions: { orderBy: { order: 'asc' } },
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
