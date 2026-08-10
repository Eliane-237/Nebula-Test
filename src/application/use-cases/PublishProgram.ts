import { DomainError } from '@/domain/errors/DomainError';
import type { ProgramRepository } from '@/application/ports/ProgramRepository';

type Input = {
  programId: string;
  coachId: string;
};

export class PublishProgram {
  constructor(private readonly programs: ProgramRepository) {}

  async execute(input: Input): Promise<void> {
    const program = await this.programs.findById(input.programId);
    if (!program) throw new DomainError('Program not found.');

    const published = program.publish(); // throws if already ARCHIVED
    await this.programs.save(published);
  }
}
