// lib/server/tenant.ts
import { mainDb } from '@/lib/db';
import { tenants } from '@/lib/db/schema/shared';
import { eq } from 'drizzle-orm';

export async function validateTenant(tenantId: string) {
  console.log(`[Tenant] Validating tenant: ${tenantId}`);
  const results = await mainDb.select().from(tenants).where(eq(tenants.tenantId, tenantId)).limit(1);
  const tenant = results[0];

  if (!tenant) {
    console.error(`[Tenant] Invalid tenant: ${tenantId}`);
    throw new Error('Tenant not found');
  }

  return tenant;
}