import { randomUUID } from 'crypto';

export class EnrollmentEntity {
  static create(userId: string, cohortId: string): EnrollmentEntity {
    return new EnrollmentEntity(randomUUID(), userId, cohortId, new Date());
  }

  constructor(
    readonly id: string,
    readonly userId: string,
    readonly cohortId: string,
    readonly enrolledAt: Date,
  ) {}
}
