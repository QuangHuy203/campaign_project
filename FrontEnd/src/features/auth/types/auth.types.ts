import { z } from 'zod';

export const loginPayloadSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
});

export type LoginPayload = z.infer<typeof loginPayloadSchema>;

export const registerPayloadSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().min(1).max(200),
  password: z.string().min(8).max(200),
});

export type RegisterPayload = z.infer<typeof registerPayloadSchema>;

export const loginResponseSchema = z.object({
  token: z.string().min(1),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export type AuthState = {
  token: string | null;
};
