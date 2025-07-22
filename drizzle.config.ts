// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import { env } from './env.mjs';  // For validated env

export default defineConfig({
  schema: './lib/db/schema/shared.ts',  // Only shared; tenants dynamic
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});