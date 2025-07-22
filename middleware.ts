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

  console.log(`[Middleware] Tenant ID found: ${tenantId}`);
  if (!tenantId) {
    console.error('[Middleware] No tenant ID found');
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // Set tenant context in headers (no validation here)
  const headers = new Headers(request.headers);
  headers.set('x-tenant-id', tenantId);
  console.log(`[Middleware] Setting x-tenant-id header: ${tenantId}`);
  console.log(`[Middleware] headers: ${JSON.stringify(Array.from(headers.entries()))}`);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};