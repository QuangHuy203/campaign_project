import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(320).transform((s) => s.trim().toLowerCase()),
  name: z.string().min(1).max(200).transform((s) => s.trim()),
  password: z.string().min(1).max(2000),
});

export const loginSchema = z.object({
  email: z.string().email().max(320).transform((s) => s.trim().toLowerCase()),
  password: z.string().min(1).max(2000),
});

