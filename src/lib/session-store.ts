import { prisma } from './prisma';
import { randomUUID } from 'crypto';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'coach' | 'admin';
};

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const sessionStore = {
  async create(user: { id: string; email: string; name: string; role: string }): Promise<string> {
    const token = randomUUID();
    await prisma.userSession.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });
    return token;
  },

  async get(token: string): Promise<SessionUser | null> {
    const session = await prisma.userSession.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session) return null;

    if (session.expiresAt < new Date()) {
      await prisma.userSession.delete({ where: { token } }).catch(() => {});
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role.toLowerCase() as SessionUser['role'],
    };
  },

  async delete(token: string): Promise<void> {
    await prisma.userSession.delete({ where: { token } }).catch(() => {});
  },
};