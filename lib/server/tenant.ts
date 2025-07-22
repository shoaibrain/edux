// lib/server/tenant.ts
import { sharedDb } from '@/lib/db';
import { tenants } from '@/lib/db/schema/shared';
import { eq } from 'drizzle-orm';

export async function validateTenant(tenantId: string) {
  console.log(`[Tenant] Validating tenant: ${tenantId}`);
  const tenant = await sharedDb.select().from(tenants).where(eq(tenants.tenantId, tenantId)).limit(1);
  if (!tenant.length) {
    console.error(`[Tenant] Invalid tenant: ${tenantId}`);
    throw new Error('Tenant not found');
  }
  return tenant[0];
}