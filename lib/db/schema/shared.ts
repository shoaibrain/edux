import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').notNull().unique(),
  name: text('name').notNull(),
  neonProjectId: text('neon_project_id').notNull().unique(),
  connectionString: text('connection_string').notNull(), // Encrypted
  createdAt: timestamp('created_at').defaultNow().notNull(),
});