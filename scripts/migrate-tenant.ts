// Create a new file: /scripts/migrate-tenant.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const connectionString = process.env.TENANT_DATABASE_URL;

  if (!connectionString) {
    throw new Error('TENANT_DATABASE_URL environment variable is not set.');
  }

  // Use postgres 'on-the-fly' with max 1 connection for migrations
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  console.log('Running migrations for tenant...');

  await migrate(db, { migrationsFolder: './drizzle/tenant' });

  console.log('Migrations completed successfully.');

  await migrationClient.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});