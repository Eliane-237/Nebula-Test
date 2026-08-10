import { CohortFullError, CohortNotOpenError, SessionCountMismatchError, SessionDateOutOfRangeError } from '@/domain/errors/DomainError';
import { DateRange } from '@/domain/value-objects/DateRange';
import { CohortCapacity } from '@/domain/value-objects/CohortCapacity';

export type CohortStatus = 'OPEN' | 'FULL' | 'CLOSED';

export class CohortEntity {
  constructor(
    readonly id: string,
    readonly programId: string,
    readonly dateRange: DateRange,
    readonly capacity: CohortCapacity,
    readonly status: CohortStatus,
    readonly programSessionCount: number,
    readonly enrolledCount: number,
  ) {}

  /**
   * Throws if enrollment is not possible. Call before saving a new Enrollment.
   */
  assertCanEnroll(): void {
    if (this.status !== 'OPEN') throw new CohortNotOpenError();
    if (!this.capacity.hasRoom(this.enrolledCount)) throw new CohortFullError();
  }

  /**
   * Validates that a proposed set of session dates satisfies all invariants:
   * - count must match programSessionCount
   * - every date must fall within the cohort window
   */
  assertValidSessions(dates: Date[]): void {
    if (dates.length !== this.programSessionCount) {
      throw new SessionCountMismatchError(this.programSessionCount, dates.length);
    }
    for (const date of dates) {
      if (!this.dateRange.contains(date)) throw new SessionDateOutOfRangeError(date);
    }
  }
}
