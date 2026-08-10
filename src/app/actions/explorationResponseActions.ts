'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

type Result = { ok: true } | { ok: false; error: string };

export async function submitExplorationResponse(
  explorationId: string,
  text: string,
): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Not authenticated.' };
  if (!text.trim()) return { ok: false, error: 'Response cannot be empty.' };

  const dbUser = await prisma.user.findUnique({
    where: { email: session.email },
    select: { id: true },
  });
  if (!dbUser) return { ok: false, error: 'User not found.' };

  try {
    await prisma.explorationResponse.upsert({
      where: { explorationId_userId: { explorationId, userId: dbUser.id } },
      update: { text: text.trim() },
      create: { explorationId, userId: dbUser.id, text: text.trim() },
    });
    return { ok: true };
  } catch (err) {
    console.error('[submitExplorationResponse]', err);
    return { ok: false, error: 'Failed to submit response.' };
  }
}

export async function addCoachFeedback(
  explorationId: string,
  studentUserId: string,
  feedback: string,
): Promise<Result> {
  const session = await getSession();
  if (!session || (session.role !== 'coach' && session.role !== 'admin')) {
    return { ok: false, error: 'Only coaches can add feedback.' };
  }
  if (!feedback.trim()) return { ok: false, error: 'Feedback cannot be empty.' };

  try {
    await prisma.explorationResponse.update({
      where: { explorationId_userId: { explorationId, userId: studentUserId } },
      data: { coachFeedback: feedback.trim() },
    });
    return { ok: true };
  } catch (err) {
    console.error('[addCoachFeedback]', err);
    return { ok: false, error: 'Failed to add feedback.' };
  }
}
