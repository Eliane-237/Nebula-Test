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

export async function quickLoginAction(formData: FormData) {
  const email      = String(formData.get('email')    ?? '').toLowerCase().trim();
  const password   = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirect') ?? '').trim();

  if (CREDENTIALS[email] !== password) return;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

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