// lib/db/index.ts
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { tenants } from './schema/shared';
import * as tenantSchema from './schema/tenant';
import { env } from '@/env.mjs';
import { decrypt } from '@/lib/crypto';
import log from '@/lib/logger';

// 1. Main DB Client (for managing tenant metadata)
const mainPool = new Pool({ connectionString: env.POSTGRES_URL });
export const mainDb = drizzle(mainPool, { schema: { tenants } });

// 2. Tenant DB Client Cache
const tenantDbCache = new Map<string, NodePgDatabase<typeof tenantSchema>>();

// 3. Function to get a tenant-specific DB client
export async function getTenantDb(tenantId: string): Promise<NodePgDatabase<typeof tenantSchema>> {
  if (tenantDbCache.has(tenantId)) {
    log.info({ tenantId }, 'Tenant DB client cache HIT.');
    return tenantDbCache.get(tenantId)!;
  }
  log.info({ tenantId }, 'Tenant DB client cache MISS.');

  const results = await mainDb
    .select({ connectionString: tenants.connectionString })
    .from(tenants)
    .where(eq(tenants.tenantId, tenantId))
    .limit(1);

  // --- Start of Fix ---
  const tenantData = results[0]; // Access the first element of the array

  if (!tenantData) {
    log.error({ tenantId }, 'Tenant not found in main database.');
    throw new Error('Tenant not found');
  }

  const decryptedConnectionString = decrypt(tenantData.connectionString);
  // --- End of Fix ---

  const tenantPool = new Pool({ connectionString: decryptedConnectionString });
  const tenantDb = drizzle(tenantPool, { schema: tenantSchema });

  tenantDbCache.set(tenantId, tenantDb);
  log.info({ tenantId }, 'Created and cached new tenant DB client.');

  return tenantDb;
}