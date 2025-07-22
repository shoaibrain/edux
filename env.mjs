import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string().min(1),
    JWT_SECRET: z.string().min(1),
  },
  client: {
    // Add any client-side env vars if needed later
  },
  runtimeEnv: {
    POSTGRES_URL: process.env.POSTGRES_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  },
});