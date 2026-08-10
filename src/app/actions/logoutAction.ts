'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionStore } from '@/lib/session-store';

export async function logoutAction() {
  const jar = await cookies();
  const token = jar.get('nebula_sid')?.value;
  if (token) {
    await sessionStore.delete(token);
    jar.delete('nebula_sid');
  }
  redirect('/login');
}
