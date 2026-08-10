import { DomainError, ProgramNotPublishedError, SessionCountMismatchError, SessionDateOutOfRangeError } from '@/domain/errors/DomainError';
import { DateRange } from '@/domain/value-objects/DateRange';
import { CohortCapacity } from '@/domain/value-objects/CohortCapacity';
import type { CohortRepository, SessionInput } from '@/application/ports/CohortRepository';
import type { ProgramRepository } from '@/application/ports/ProgramRepository';

type Input = {
  programId: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  sessions: SessionInput[];
};

export class CreateCohortWithSessions {
  constructor(
    private readonly programs: ProgramRepository,
    private readonly cohorts: CohortRepository,
  ) {}

  async execute(input: Input): Promise<void> {
    const program = await this.programs.findById(input.programId);
    if (!program) throw new DomainError('Program not found.');
    if (!program.isVisibleToStudents()) throw new ProgramNotPublishedError();

    // Value objects validate themselves — throws on bad input
    const dateRange = new DateRange(input.startDate, input.endDate);
    const capacity = new CohortCapacity(input.maxParticipants);

    if (input.sessions.length !== program.sessionCount) {
      throw new SessionCountMismatchError(program.sessionCount, input.sessions.length);
    }

    for (const session of input.sessions) {
      if (!dateRange.contains(session.date)) throw new SessionDateOutOfRangeError(session.date);
    }

    await this.cohorts.save({
      programId: input.programId,
      programSessionCount: program.sessionCount,
      dateRange,
      capacity,
      sessions: input.sessions,
    });
  }
}

/**
 * Bonus: auto-distribute session dates evenly across a cohort period.
 * Returns `count` dates starting at startDate, ending at endDate.
 */
export function distributeSessionDates(startDate: Date, endDate: Date, count: number): Date[] {
  if (count === 1) return [new Date(startDate)];
  const totalMs = endDate.getTime() - startDate.getTime();
  const interval = totalMs / (count - 1);
  return Array.from({ length: count }, (_, i) =>
    new Date(startDate.getTime() + Math.round(interval * i)),
  );
}
