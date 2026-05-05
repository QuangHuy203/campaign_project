import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { badRequest, conflict, unauthorized } from '../errors/AppError';
import { db } from '../db/knex';
import { findUserByEmail, insertUser } from '../repos/userRepo';
import { decodePassword } from '../utils/passwordCrypto';

/** Registration is the identity-creation step: store only a one-way password hash and reject duplicate emails so a login uniquely identifies one person. */
export async function registerUser(args: { email: string; name: string; password: string }) {
  const plainPassword = decodePassword(args.password);
  if (plainPassword.length < 8 || plainPassword.length > 200) {
    throw badRequest('Password must be between 8 and 200 characters');
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);
  try {
    const user = await insertUser(db, { email: args.email, name: args.name, passwordHash });
    return user;
  } catch (e: unknown) {
    const pgErr = e as { code?: string };
    if (pgErr.code === '23505') {
      throw conflict('Email already exists');
    }
    throw e;
  }
}

/** Login returns an access token (not user secrets) so clients can authenticate subsequent requests without ever receiving/storing the password. */
export async function loginUser(args: { email: string; password: string }) {
  const user = await findUserByEmail(db, args.email);
  if (!user) throw unauthorized('Invalid credentials');

  const plainPassword = decodePassword(args.password);
  const ok = await bcrypt.compare(plainPassword, user.password_hash);
  if (!ok) throw unauthorized('Invalid credentials');

  const token = jwt.sign({ sub: String(user.id) }, env.JWT_SECRET, { expiresIn: '1h' });
  return { token };
}

