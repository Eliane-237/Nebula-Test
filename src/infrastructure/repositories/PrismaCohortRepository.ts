import { prisma } from '@/lib/prisma';
import { CohortEntity } from '@/domain/entities/Cohort';
import { DateRange } from '@/domain/value-objects/DateRange';
import { CohortCapacity } from '@/domain/value-objects/CohortCapacity';
import type { CohortRepository, CreateCohortData } from '@/application/ports/CohortRepository';

export class PrismaCohortRepository implements CohortRepository {
  async findById(id: string): Promise<CohortEntity | null> {
    const row = await prisma.cohort.findUnique({
      where: { id },
      include: {
        program: { select: { numSessions: true } },
        _count:  { select: { enrollments: true } },
      },
    });
    if (!row) return null;

    return new CohortEntity(
      row.id,
      row.programId,
      new DateRange(row.startDate, row.endDate),
      new CohortCapacity(row.maxParticipants),
      row.status,
      row.program.numSessions,
      row._count.enrollments,
    );
  }

  async save(data: CreateCohortData): Promise<CohortEntity> {
    const row = await prisma.cohort.create({
      data: {
        programId:      data.programId,
        startDate:      data.dateRange.start,
        endDate:        data.dateRange.end,
        maxParticipants: data.capacity.value,
        sessions: {
          create: data.sessions.map((s) => ({
            title:       s.title,
            description: s.description,
            dateTime:    s.date,
            order:       s.order,
            duration:    45,
          })),
        },
      },
      include: { _count: { select: { enrollments: true } } },
    });

    return new CohortEntity(
      row.id,
      data.programId,
      data.dateRange,
      data.capacity,
      'OPEN',
      data.programSessionCount,
      0,
    );
  }
}
