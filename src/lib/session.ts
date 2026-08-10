import { cookies } from 'next/headers';
import { sessionStore, type SessionUser } from './session-store';

export type { SessionUser };

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get('nebula_sid')?.value;
  if (!token) return null;
  return sessionStore.get(token);
}
