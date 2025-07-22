// app/api/tenants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sharedDb, getTenantDb, executeRawQuery } from '@/lib/db';
import { tenants } from '@/lib/db/schema/shared';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { TenantSignupDto } from '@/lib/dto/tenant';
import z from 'zod/v4';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = TenantSignupDto.parse(body);
    const tenantId = data.tenantId;  // Use provided tenantId (no randomization)
    const schemaName = `tenant_${tenantId}`;

    console.log(`[API] Creating tenant: ${tenantId}, schema: ${schemaName}`);

    // Check if tenant exists (enterprise-grade unique check)
    const existing = await sharedDb.select().from(tenants).where(eq(tenants.tenantId, tenantId));
    if (existing.length) {
      return NextResponse.json({ error: 'Tenant ID already exists' }, { status: 409 });
    }

    // Create schema and users table
    await executeRawQuery(`CREATE SCHEMA IF NOT EXISTS "${schemaName}";`);
    await executeRawQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

    // Insert tenant metadata
    await sharedDb.insert(tenants).values({
      tenantId,
      schemaName,
      name: data.orgName,
    });

    // Insert admin user
    const { db: tenantDb, schema } = await getTenantDb(tenantId);
    const hashedPassword = await bcrypt.hash(data.adminPassword, 12);  // Stronger salt (12 rounds)
    await tenantDb.insert(schema.users).values({
      name: data.adminName,
      email: data.adminEmail,
      password: hashedPassword,
    });

    console.log(`[API] Tenant created successfully: ${tenantId}`);
    return NextResponse.json({ message: 'Tenant created', tenantId });
  } catch (err) {
    console.error('[API] Tenant creation failed:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}