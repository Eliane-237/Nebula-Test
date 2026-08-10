import { DomainError } from '@/domain/errors/DomainError';
import { CohortCapacity } from '@/domain/value-objects/CohortCapacity';
import type { ProgramRepository, CreateProgramData } from '@/application/ports/ProgramRepository';

export class CreateProgram {
  constructor(private readonly programs: ProgramRepository) {}

  async execute(input: CreateProgramData): Promise<string> {
    if (input.sessionCount < 2 || input.sessionCount > 4) {
      throw new DomainError('Session count must be between 2 and 4.');
    }
    // Reuse CohortCapacity validation — maxCohortSize shares the same 1-20 rule
    new CohortCapacity(input.maxCohortSize);

    const program = await this.programs.create(input);
    return program.id;
  }
}
