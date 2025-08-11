// drizzle.tenant.config.ts

import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  dialect: 'postgresql',
  // Make sure this points to your tenant-specific schema file(s)
  schema: './lib/db/schema/tenant.ts', 
  // This is the crucial line to add/correct
  out: './drizzle/tenant', 
  dbCredentials: {
    url: process.env.TENANT_DATABASE_URL || 'postgresql://user:password@host:port/db',
  },
  verbose: true,
  strict: true,
});