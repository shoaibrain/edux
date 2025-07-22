// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginDto } from '@/lib/dto/tenant';
import { validateTenant } from '@/lib/server/tenant';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant required' }, { status: 400 });
    }

    // Validate tenant existence
    await validateTenant(tenantId);

    const body = await request.json();
    const data = LoginDto.parse(body);

    console.log(`[API] Login attempt for tenant: ${tenantId}, email: ${data.email}`);

    const { db: tenantDb, schema } = await getTenantDb(tenantId);
    const users = await tenantDb.select().from(schema.users).where(eq(schema.users.email, data.email)).limit(1);

    if (!users.length) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];
    const match = await bcrypt.compare(data.password, user.password);
    if (!match) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ tenantId, userId: user.id }, env.JWT_SECRET, { expiresIn: '1h' });

    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set('authToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 3600 });
    return response;
  } catch (err) {
    console.error('[API] Login failed:', err);
    if (err instanceof Error && err.message === 'Tenant not found') {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}