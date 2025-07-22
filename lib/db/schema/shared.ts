// lib/db/schema/shared.ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').notNull().unique(),
  schemaName: text('schema_name').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});