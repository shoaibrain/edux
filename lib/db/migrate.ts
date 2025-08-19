import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs/promises';
import path from 'path';
import log from '@/lib/logger';

/**
 * Applies the full tenant schema from a single SQL file to a new tenant database.
 * This method is reliable in serverless environments where migration folders may not be available.
 * @param {string} connectionString - The connection string for the new tenant database.
 */
export async function runTenantMigrations(connectionString: string) {
  const migrationClient = postgres(connectionString, { max: 1 });
  
  try {
    log.info('Applying tenant schema from SQL snapshot...');
    
    // Construct the path to the schema file. This assumes the file is at the root of the project.
    const schemaPath = path.join(process.cwd(), 'drizzle', 'tenant', '0000_gifted_toad_men.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf-8');

    // Execute the entire schema SQL as a single query
    await migrationClient.unsafe(schemaSql);

    log.info('Tenant schema applied successfully.');
  } catch (error) {
    log.error({ error }, 'Applying tenant schema failed.');
    // Re-throw the error to ensure the API call fails loudly and triggers cleanup
    throw new Error('Could not apply tenant schema.');
  } finally {
    // Ensure the connection is closed
    await migrationClient.end();
  }
}
