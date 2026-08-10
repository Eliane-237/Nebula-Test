'use server';

import { prisma } from '@/lib/prisma';

export async function getAdminStats() {
  try {
    const [
      totalPrograms,
      publishedPrograms,
      activeCohorts,
      totalEnrollments,
      totalStudents,
      totalCoaches,
      upcomingSessions,
      latestEnrollments,
      pendingCoachApplications,
      allPrograms,
    ] = await Promise.all([
      prisma.program.count(),
      prisma.program.count({ where: { status: 'PUBLISHED' } }),
      prisma.cohort.count({ where: { status: 'OPEN' } }),
      prisma.enrollment.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'COACH' } }),
      prisma.session.findMany({
        where:   { dateTime: { gte: new Date() } },
        include: { cohort: { include: { program: { select: { title: true } } } } },
        orderBy: { dateTime: 'asc' },
        take: 6,
      }),
      prisma.enrollment.findMany({
        include: {
          user:  { select: { name: true } },
          cohort: { include: { program: { select: { title: true } } } },
        },
        orderBy: { enrolledAt: 'desc' },
        take: 7,
      }),
      prisma.coachApplication.findMany({
        where:   { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.program.findMany({
        include: {
          coach:  { select: { name: true } },
          _count: { select: { cohorts: true } },
          cohorts: { select: { _count: { select: { enrollments: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: {
        totalPrograms,
        publishedPrograms,
        activeCohorts,
        totalEnrollments,
        totalStudents,
        totalCoaches,
        upcomingSessions,
        latestEnrollments,
        pendingCoachApplications,
        allPrograms: allPrograms.map((p) => ({
          id:            p.id,
          title:         p.title,
          domain:        p.domain,
          status:        p.status,
          coachName:     p.coach.name,
          cohortCount:   p._count.cohorts,
          totalEnrolled: p.cohorts.reduce((s, c) => s + c._count.enrollments, 0),
        })),
      },
      error: null,
    };
  } catch (err) {
    console.error('[getAdminStats]', err);
    return { data: null, error: 'Failed to load dashboard stats.' };
  }
}
