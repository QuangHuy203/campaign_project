import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from '../validators/authValidators';
import { loginUser, registerUser } from '../services/authService';

/** Public entrypoint for account creation; validation happens here, business rules live in the service. */
export async function register(req: Request, res: Response) {
  const body = registerSchema.parse(req.body);
  const user = await registerUser(body);
  return res.status(201).json({ data: user });
}

/** Public entrypoint for session creation; response returns a token only (no password or hash). */
export async function login(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);
  const result = await loginUser(body);
  return res.status(200).json({ data: result });
}

