import { AlreadyEnrolledError, DomainError } from '@/domain/errors/DomainError';
import { EnrollmentEntity } from '@/domain/entities/Enrollment';
import type { CohortRepository } from '@/application/ports/CohortRepository';
import type { EnrollmentRepository } from '@/application/ports/EnrollmentRepository';

type Input = {
  userId: string;
  cohortId: string;
};

export class EnrollStudentInCohort {
  constructor(
    private readonly cohorts: CohortRepository,
    private readonly enrollments: EnrollmentRepository,
  ) {}

  async execute(input: Input): Promise<void> {
    const cohort = await this.cohorts.findById(input.cohortId);
    if (!cohort) throw new DomainError('Cohort not found.');

    const alreadyEnrolled = await this.enrollments.existsForUserAndCohort(
      input.userId,
      input.cohortId,
    );
    if (alreadyEnrolled) throw new AlreadyEnrolledError();

    cohort.assertCanEnroll(); // throws CohortNotOpenError or CohortFullError

    const enrollment = EnrollmentEntity.create(input.userId, input.cohortId);
    await this.enrollments.save(enrollment);
  }
}
