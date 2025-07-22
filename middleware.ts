// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const parts = host.split('.');
  const tenantId = parts.length > 2 ? parts[0] : null;  // e.g., tenant1.localhost:3000 → tenant1

  console.log(`[Middleware] Host: ${host}, Tenant ID: ${tenantId}`);

  // Public routes (no tenant needed) - added '/'
  const pathname = request.nextUrl.pathname;
  if (!tenantId && (pathname === '/' || pathname.startsWith('/signup') || pathname.startsWith('/login') || pathname.startsWith('/api/tenants') || pathname.startsWith('/api/auth'))) {
    return NextResponse.next();
  }

  if (!tenantId) {
    console.error('[Middleware] No tenant ID found');
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // Set tenant context in headers (no validation here)
  const headers = new Headers(request.headers);
  headers.set('x-tenant-id', tenantId);

  // Optional: Auth check (JWT verify can stay if jsonwebtoken polyfilled, but move DB to routes)
  // ... your existing auth logic, but skip DB-dependent parts ...

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};