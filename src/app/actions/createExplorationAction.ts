'use server';

import { prisma } from '@/lib/prisma';
import { DomainError } from '@/domain/errors/DomainError';

type Input = {
  programId: string;
  title: string;
  description: string;
  dueDate?: string;
};

type Result = { ok: true } | { ok: false; error: string };

export async function createExplorationAction(input: Input): Promise<Result> {
  if (!input.title.trim()) return { ok: false, error: 'Title is required.' };
  if (!input.description.trim()) return { ok: false, error: 'Description is required.' };

  try {
    await prisma.exploration.create({
      data: {
        programId: input.programId,
        title: input.title.trim(),
        description: input.description.trim(),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      },
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof DomainError) return { ok: false, error: err.message };
    console.error('[createExplorationAction]', err);
    return { ok: false, error: 'Failed to create exploration.' };
  }
}
