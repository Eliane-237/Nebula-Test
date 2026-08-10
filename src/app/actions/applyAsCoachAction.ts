'use server';

import { prisma } from '@/lib/prisma';

type FormState = { success: boolean; error?: string } | null;

export async function applyAsCoachAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name       = String(formData.get('name')       ?? '').trim();
  const email      = String(formData.get('email')      ?? '').trim();
  const domain     = String(formData.get('domain')     ?? '').trim();
  const experience = String(formData.get('experience') ?? '').trim();
  const motivation = String(formData.get('motivation') ?? '').trim();

  if (!name || !email || !domain || !experience || !motivation) {
    return { success: false, error: 'Tous les champs sont obligatoires.' };
  }

  try {
    await prisma.coachApplication.create({
      data: { name, email, domain, experience, motivation },
    });
    return { success: true };
  } catch {
    return { success: false, error: 'Une erreur est survenue. Réessayez.' };
  }
}
