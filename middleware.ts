import { NextRequest, NextResponse } from 'next/server';
import log from './lib/logger';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;


  log.info('Middleware processing request');  
  // For dashboard access, check for an auth token.
  const token = request.cookies.get('authToken');
  if (pathname.startsWith('/dashboard') && !token) {
    log.warn('Access to dashboard denied without token, redirecting to login.');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
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
