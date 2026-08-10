import { InvalidDateRangeError } from '@/domain/errors/DomainError';

export class DateRange {
  readonly start: Date;
  readonly end: Date;

  constructor(start: Date, end: Date) {
    if (end <= start) throw new InvalidDateRangeError(start, end);
    this.start = start;
    this.end = end;
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  durationDays(): number {
    return Math.ceil((this.end.getTime() - this.start.getTime()) / 86_400_000);
  }
}
