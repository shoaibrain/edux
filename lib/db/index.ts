// lib/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, Client } from 'pg';
import { pgSchema } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { tenants } from './schema/shared';
import { usersColumns } from './schema/tenant';
import { env } from '../../env.mjs';

// Single shared pool for the entire database (all schemas)
const sharedPool = new Pool({ connectionString: env.POSTGRES_URL });
export const sharedDb = drizzle(sharedPool);

// Function to get tenant-specific DB (dynamic schema qualification, same pool)
export async function getTenantDb(tenantId: string) {
  console.log(`[DB] Resolving tenant DB for ${tenantId}`);
  const tenant = await sharedDb.select().from(tenants).where(eq(tenants.tenantId, tenantId)).limit(1);
  if (!tenant.length) {
    console.error(`[DB] Tenant not found: ${tenantId}`);
    throw new Error('Tenant not found');
  }
  const schemaName = tenant[0].schemaName;

  const tenantSchema = pgSchema(schemaName);
  const users = tenantSchema.table('users', usersColumns);

  const tenantDb = drizzle(sharedPool, { schema: { users } });
  console.log(`[DB] Tenant DB initialized for schema: ${schemaName}`);
  return { db: tenantDb, schema: { users } };
}

// For raw queries (e.g., schema creation)
export async function executeRawQuery(query: string) {
  const client = new Client({ connectionString: env.POSTGRES_URL });
  await client.connect();
  try {
    await client.query(query);
    console.log(`[DB] Executed raw query: ${query.substring(0, 50)}...`);
  } finally {
    await client.end();
  }
}

// Export types
export type TenantDb = Awaited<ReturnType<typeof getTenantDb>>;