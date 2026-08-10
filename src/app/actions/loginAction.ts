'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { sessionStore } from '@/lib/session-store';

const CREDENTIALS: Record<string, string> = {
  'student@nebula.com': 'student123',
  'coach@nebula.com': 'coach123',
  'admin@nebula.com': 'admin123',
};

type State = { error: string } | null;

export async function loginAction(_prev: State, formData: FormData): Promise<State> {
  const email      = String(formData.get('email')    ?? '').toLowerCase().trim();
  const password   = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirect') ?? '').trim();

  if (CREDENTIALS[email] !== password) {
    return { error: 'Email ou mot de passe incorrect.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: 'Compte introuvable en base — as-tu lancé le seed ?' };

  const token = await sessionStore.create(user);

  const jar = await cookies();
  jar.set('nebula_sid', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  const roleDest =
    user.role === 'ADMIN' ? '/admin' :
    user.role === 'COACH' ? '/coach/programs' :
    '/my-programs';

  const dest = (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//'))
    ? redirectTo
    : roleDest;

  redirect(dest);
}