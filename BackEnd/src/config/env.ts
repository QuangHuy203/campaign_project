import dotenv from 'dotenv';
import { z } from 'zod';

export type Env = {
  NODE_ENV?: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
  TEST_DATABASE_URL?: string;
  JWT_SECRET: string;
  AUTH_CRYPTO_KEY: string;
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  TEST_DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(16),
  AUTH_CRYPTO_KEY: z.string().min(16).default('change_me_auth_crypto_secret'),
}) satisfies z.ZodType<Env>;

dotenv.config();

export const env: Env = envSchema.parse(process.env);
