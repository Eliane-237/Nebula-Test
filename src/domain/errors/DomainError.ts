export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidDateRangeError extends DomainError {
  constructor(start: Date, end: Date) {
    super(`End date must be after start date. Got ${start.toISOString()} → ${end.toISOString()}.`);
  }
}

export class InvalidCohortCapacityError extends DomainError {
  constructor(value: number) {
    super(`Cohort capacity must be between 1 and 20. Got: ${value}.`);
  }
}

export class SessionCountMismatchError extends DomainError {
  constructor(expected: number, got: number) {
    super(`Cohort must have ${expected} session(s) to match the program. Got ${got}.`);
  }
}

export class SessionDateOutOfRangeError extends DomainError {
  constructor(date: Date) {
    super(`Session date ${date.toISOString()} falls outside the cohort period.`);
  }
}

export class CohortNotOpenError extends DomainError {
  constructor() {
    super('This cohort is not open for enrollment.');
  }
}

export class CohortFullError extends DomainError {
  constructor() {
    super('This cohort is full.');
  }
}

export class AlreadyEnrolledError extends DomainError {
  constructor() {
    super('Student is already enrolled in this cohort.');
  }
}

export class ProgramNotPublishedError extends DomainError {
  constructor() {
    super('Cannot create a cohort for a program that is not published.');
  }
}
