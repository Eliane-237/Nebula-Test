import { CohortEntity } from '@/domain/entities/Cohort';
import { DateRange } from '@/domain/value-objects/DateRange';
import { CohortCapacity } from '@/domain/value-objects/CohortCapacity';

export type SessionInput = {
  title: string;
  description?: string;
  date: Date;
  order: number;
};

export type CreateCohortData = {
  programId: string;
  programSessionCount: number;
  dateRange: DateRange;
  capacity: CohortCapacity;
  sessions: SessionInput[];
};

export interface CohortRepository {
  findById(id: string): Promise<CohortEntity | null>;
  save(data: CreateCohortData): Promise<CohortEntity>;
}
