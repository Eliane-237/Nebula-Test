import { DomainError } from '@/domain/errors/DomainError';

export type ProgramStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export class ProgramEntity {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly status: ProgramStatus,
    readonly sessionCount: number,
    readonly maxCohortSize: number,
  ) {}

  isVisibleToStudents(): boolean {
    return this.status === 'PUBLISHED';
  }

  publish(): ProgramEntity {
    if (this.status === 'ARCHIVED') {
      throw new DomainError('Cannot publish an archived program.');
    }
    return new ProgramEntity(
      this.id,
      this.title,
      'PUBLISHED',
      this.sessionCount,
      this.maxCohortSize,
    );
  }

  archive(): ProgramEntity {
    return new ProgramEntity(
      this.id,
      this.title,
      'ARCHIVED',
      this.sessionCount,
      this.maxCohortSize,
    );
  }
}
