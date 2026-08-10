import { prisma } from '@/lib/prisma';
import { EnrollmentEntity } from '@/domain/entities/Enrollment';
import type { EnrollmentRepository } from '@/application/ports/EnrollmentRepository';

export class PrismaEnrollmentRepository implements EnrollmentRepository {
  async existsForUserAndCohort(userId: string, cohortId: string): Promise<boolean> {
    const count = await prisma.enrollment.count({ where: { userId, cohortId } });
    return count > 0;
  }

  async save(enrollment: EnrollmentEntity): Promise<void> {
    await prisma.enrollment.create({
      data: {
        id: enrollment.id,
        userId: enrollment.userId,
        cohortId: enrollment.cohortId,
        enrolledAt: enrollment.enrolledAt,
      },
    });
  }
}
