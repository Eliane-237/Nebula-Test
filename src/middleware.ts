import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that never require authentication
const PUBLIC_PREFIXES = ['/login', '/programs', '/_next', '/favicon.ico'];

// Role-gated prefixes: if cookie present but role doesn't match, redirect to their home
const ROLE_GATES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/admin',         roles: ['admin'] },
  { prefix: '/coach',         roles: ['coach', 'admin'] },
  { prefix: '/my-programs',   roles: ['student', 'admin'] },
  { prefix: '/dashboard',     roles: ['student', 'coach', 'admin'] },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('nebula_sid')?.value;

  // No session → redirect to login
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|favicon.ico).*)'],
};
