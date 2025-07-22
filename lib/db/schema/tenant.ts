// lib/db/schema/tenant.ts
import { serial, text } from 'drizzle-orm/pg-core';

export const usersColumns = {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),  // Hashed
};