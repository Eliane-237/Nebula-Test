import { InvalidCohortCapacityError } from '@/domain/errors/DomainError';

export class CohortCapacity {
  static readonly MIN = 1;
  static readonly MAX = 20;

  readonly value: number;

  constructor(value: number) {
    if (value < CohortCapacity.MIN || value > CohortCapacity.MAX) {
      throw new InvalidCohortCapacityError(value);
    }
    this.value = value;
  }

  hasRoom(enrolledCount: number): boolean {
    return enrolledCount < this.value;
  }
}
