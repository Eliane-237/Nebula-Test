'use server';

import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionStore, type SessionUser } from '@/lib/session-store';

const ACCOUNTS: Record<string, { user: SessionUser; password: string }> = {
  'student@nebula.com': {
    password: 'student123',
    user: { id: 'usr_student', email: 'student@nebula.com', name: 'Alex Carter',   role: 'student' },
  },
  'coach@nebula.com': {
    password: 'coach123',
    user: { id: 'usr_coach',   email: 'coach@nebula.com',   name: 'Maya Thompson', role: 'coach'   },
  },
  'admin@nebula.com': {
    password: 'admin123',
    user: { id: 'usr_admin',   email: 'admin@nebula.com',   name: 'Alicia Davis',  role: 'admin'   },
  },
};

type State = { error: string } | null;

export async function loginAction(_prev: State, formData: FormData): Promise<State> {
  const email    = String(formData.get('email')    ?? '').toLowerCase().trim();
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirect') ?? '').trim();

  const account = ACCOUNTS[email];
  if (!account || account.password !== password) {
    return { error: 'Email ou mot de passe incorrect.' };
  }

  const token = randomUUID();
  sessionStore.set(token, account.user);

  const jar = await cookies();
  jar.set('nebula_sid', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  const roleDest =
    account.user.role === 'admin' ? '/admin' :
    account.user.role === 'coach' ? '/coach/programs' :
    '/my-programs';

  // Honour the ?redirect= param if it points to a safe internal path
  const dest = (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//'))
    ? redirectTo
    : roleDest;

  redirect(dest);
}
