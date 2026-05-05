const ENCRYPTED_PREFIX = 'enc:v1';
const FALLBACK_SECRET = 'change_me_auth_crypto_secret';

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function getSecretKey(): string {
  return import.meta.env.VITE_AUTH_CRYPTO_KEY ?? FALLBACK_SECRET;
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
  return crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-GCM' }, false, ['encrypt']);
}

export async function encryptPassword(plainPassword: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(getSecretKey());
  const data = new TextEncoder().encode(plainPassword);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data));
  return `${ENCRYPTED_PREFIX}:${toBase64(iv)}:${toBase64(encrypted)}`;
}

