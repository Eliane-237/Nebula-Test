import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Exact-match public routes (careful: '/' must never go through startsWith)
const PUBLIC_EXACT = ['/'];

// Prefix-match public routes
const PUBLIC_PREFIXES = ['/login', '/register', '/programs', '/_next', '/favicon.ico'];

// Role-gated prefixes: if cookie present but role doesn't match, redirect to their home
const ROLE_GATES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/admin',       roles: ['admin'] },
  { prefix: '/coach',       roles: ['coach', 'admin'] },
  { prefix: '/my-programs', roles: ['student', 'admin'] },
  { prefix: '/dashboard',   roles: ['student', 'coach', 'admin'] },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get('nebula_sid')?.value;

  // No session → redirect to login
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/programs';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|favicon.ico).*)'],
};