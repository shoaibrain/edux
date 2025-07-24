import { NextRequest, NextResponse } from 'next/server';
import logger from './lib/logger';

// Extracts the tenant ID from the hostname.
const getTenantId = (host: string): string | null => {
  const parts = host.split('.');

  // Handles tenant.localhost:3000 in development
  if (process.env.NODE_ENV === 'development' && parts.length === 2 && parts[1].startsWith('localhost')) {
    return parts[0];
  }

  // Handles tenant.example.com in production
  if (process.env.NODE_ENV === 'production' && parts.length > 1 && parts[0] !== 'www') {
    return parts[0];
  }

  return null;
};


export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const tenantId = getTenantId(host);
  const { pathname } = request.nextUrl;
  const log = logger.child({ tenantId, pathname });

  log.info('Middleware processing request');

  console.log('Incoming cookies:', request.cookies.getAll());
  console.log('TenantId:', tenantId, 'Pathname:', pathname);

  const headers = new Headers(request.headers);
  if (tenantId) {
    headers.set('x-tenant-id', tenantId);
  }

  // Allow public routes regardless of tenant.
  if (pathname === '/' || pathname === '/signup') {
    return NextResponse.next({ request: { headers } });
  }

  // If on a tenant subdomain, allow access to login.
  if (tenantId && pathname.startsWith('/login')) {
      return NextResponse.next({ request: { headers } });
  }

  // All API routes are allowed to pass through for now;
  // authentication will be handled at the route level.
  if (pathname.startsWith('/api')) {
    return NextResponse.next({ request: { headers } });
  }

  // For dashboard access, check for an auth token.
  const token = request.cookies.get('authToken');
  if (pathname.startsWith('/dashboard') && !token) {
    log.warn('Access to dashboard denied without token, redirecting to login.');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};