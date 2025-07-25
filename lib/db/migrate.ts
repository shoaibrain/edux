// In /lib/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import log from '@/lib/logger';

export async function runTenantMigrations(connectionString: string) {
  // Use postgres 'on-the-fly' with max 1 connection for migrations
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    log.info('Starting tenant migration...');
    await migrate(db, { migrationsFolder: './drizzle/tenant' });
    log.info('Tenant migration completed successfully.');
  } catch (error) {
    log.error({ error }, 'Tenant migration failed.');
    // Re-throw the error to ensure the API call fails loudly
    throw new Error('Could not run tenant migrations.');
  } finally {
    // Ensure the connection is closed
    await migrationClient.end();
  }
}