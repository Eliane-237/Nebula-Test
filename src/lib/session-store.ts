export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'coach' | 'admin';
};

type Entry = { user: SessionUser; expiresAt: number };

// Persist the Map across Next.js hot-reloads in dev mode (globalThis trick)
declare global {
  // eslint-disable-next-line no-var
  var _nebulaSessionStore: Map<string, Entry> | undefined;
}

const store: Map<string, Entry> =
  (globalThis._nebulaSessionStore ??= new Map<string, Entry>());

if (process.env.NODE_ENV !== 'production') {
  globalThis._nebulaSessionStore = store;
}

export const sessionStore = {
  set(token: string, user: SessionUser): void {
    store.set(token, {
      user,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
  },
  get(token: string): SessionUser | null {
    const entry = store.get(token);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      store.delete(token);
      return null;
    }
    return entry.user;
  },
  delete(token: string): void {
    store.delete(token);
  },
};
