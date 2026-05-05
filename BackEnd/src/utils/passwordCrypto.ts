import { createDecipheriv, createHash } from 'crypto';
import { env } from '../config/env';
import { badRequest } from '../errors/AppError';

const ENCRYPTED_PREFIX = 'enc:v1:';

function getKey(): Buffer {
  return createHash('sha256').update(env.AUTH_CRYPTO_KEY).digest();
}

export function decodePassword(input: string): string {
  if (!input.startsWith(ENCRYPTED_PREFIX)) {
    return input;
  }

  const payload = input.slice(ENCRYPTED_PREFIX.length);
  const [ivBase64, encryptedBase64] = payload.split(':');
  if (!ivBase64 || !encryptedBase64) {
    throw badRequest('Invalid encrypted password payload');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const encrypted = Buffer.from(encryptedBase64, 'base64');
  if (encrypted.length < 17) {
    throw badRequest('Invalid encrypted password payload');
  }

  const authTag = encrypted.subarray(encrypted.length - 16);
  const cipherText = encrypted.subarray(0, encrypted.length - 16);

  try {
    const decipher = createDecipheriv('aes-256-gcm', getKey(), iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    throw badRequest('Invalid encrypted password payload');
  }
}

