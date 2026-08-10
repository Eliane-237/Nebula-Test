import { ProgramEntity } from '@/domain/entities/Program';

export type CreateProgramData = {
  title: string;
  description: string;
  domain: string;
  targetAudience: string;
  difficulty: string;
  sessionCount: number;
  recommendedSize: number;
  maxCohortSize: number;
  learningOutcomes: string[];
  coachId: string;
};

export interface ProgramRepository {
  findById(id: string): Promise<ProgramEntity | null>;
  findByCoachId(coachId: string): Promise<ProgramEntity[]>;
  create(data: CreateProgramData): Promise<ProgramEntity>;
  save(program: ProgramEntity): Promise<void>;
}
