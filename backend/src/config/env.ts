import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3333),
  CORS_ORIGIN: z.url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(3600),
  AUTH_COOKIE_NAME: z.string().min(1).default('observasrs_sessao'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const details = z.prettifyError(result.error);
  throw new Error(`Variaveis de ambiente invalidas:\n${details}`);
}

export const env = result.data;
