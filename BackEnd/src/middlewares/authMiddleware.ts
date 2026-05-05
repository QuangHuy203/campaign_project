import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { unauthorized } from '../errors/AppError';

export type AuthUser = { id: number };

type JwtPayload = { sub: string };

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

/** Auth boundary: require a valid Bearer token and attach `req.user` so downstream code can enforce "users only access their own data". */
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? req.header('Authorization');
  if (!header) return next(unauthorized());

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(unauthorized());

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const id = Number(decoded.sub);
    if (!Number.isInteger(id) || id <= 0) return next(unauthorized());
    req.user = { id };
    return next();
  } catch {
    return next(unauthorized());
  }
}

