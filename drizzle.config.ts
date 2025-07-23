import { defineConfig } from 'drizzle-kit';
import { env } from './env.mjs';

export default defineConfig({
  schema: './lib/db/schema/shared.ts',
  out: './drizzle/main-migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
});