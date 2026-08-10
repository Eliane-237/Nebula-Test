import { prisma } from '@/lib/prisma';
import { ProgramEntity } from '@/domain/entities/Program';
import type { ProgramRepository, CreateProgramData } from '@/application/ports/ProgramRepository';
import type { ProgramStatus } from '@/domain/entities/Program';

function toEntity(row: {
  id: string; title: string; status: string; numSessions: number; maxCohortSize: number;
}): ProgramEntity {
  return new ProgramEntity(row.id, row.title, row.status as ProgramStatus, row.numSessions, row.maxCohortSize);
}

export class PrismaProgramRepository implements ProgramRepository {
  async findById(id: string): Promise<ProgramEntity | null> {
    const row = await prisma.program.findUnique({
      where:  { id },
      select: { id: true, title: true, status: true, numSessions: true, maxCohortSize: true },
    });
    return row ? toEntity(row) : null;
  }

  async findByCoachId(coachId: string): Promise<ProgramEntity[]> {
    const rows = await prisma.program.findMany({
      where:   { coachId },
      select:  { id: true, title: true, status: true, numSessions: true, maxCohortSize: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toEntity);
  }

  async create(data: CreateProgramData): Promise<ProgramEntity> {
    const row = await prisma.program.create({
      data: {
        title:           data.title,
        description:     data.description,
        domain:          data.domain as never,
        targetAudience:  data.targetAudience,
        difficulty:      data.difficulty as never,
        numSessions:     data.sessionCount,
        recommendedSize: data.recommendedSize,
        maxCohortSize:   data.maxCohortSize,
        learningOutcomes: data.learningOutcomes,
        coachId:         data.coachId,
        status:          'DRAFT',
      },
      select: { id: true, title: true, status: true, numSessions: true, maxCohortSize: true },
    });
    return toEntity(row);
  }

  async save(program: ProgramEntity): Promise<void> {
    await prisma.program.update({
      where: { id: program.id },
      data:  { status: program.status },
    });
  }
}
