import { EnrollmentEntity } from '@/domain/entities/Enrollment';

export interface EnrollmentRepository {
  existsForUserAndCohort(userId: string, cohortId: string): Promise<boolean>;
  save(enrollment: EnrollmentEntity): Promise<void>;
}
