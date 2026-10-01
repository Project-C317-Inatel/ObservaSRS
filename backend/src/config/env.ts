import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3333),
  CORS_ORIGIN: z.url().default('http://localhost:5173'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const details = z.prettifyError(result.error);
  throw new Error(`Variaveis de ambiente invalidas:\n${details}`);
}

export const env = result.data;
