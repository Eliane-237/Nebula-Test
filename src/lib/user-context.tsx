'use client';

import { createContext, useContext } from 'react';
import type { SessionUser } from './session-store';

const UserCtx = createContext<SessionUser | null>(null);

export function useUser(): SessionUser {
  const user = useContext(UserCtx);
  if (!user) throw new Error('useUser() must be called inside a protected layout');
  return user;
}

export function UserProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return <UserCtx.Provider value={user}>{children}</UserCtx.Provider>;
}
