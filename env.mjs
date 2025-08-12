import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
    NEON_API_KEY: z.string().min(1),
    NEON_ORG_ID: z.string().min(1),
    ENCRYPTION_KEY: z.string().min(1, "ENCRYPTION_KEY must be 32 characters long"),
    RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY must be provided"),
    
  },
  client: {},
  runtimeEnv: {
    POSTGRES_URL: process.env.POSTGRES_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEON_API_KEY: process.env.NEON_API_KEY,
    NEON_ORG_ID: process.env.NEON_ORG_ID,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
});