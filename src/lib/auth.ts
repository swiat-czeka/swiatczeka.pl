import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const cookieName = 'swiatczeka_session';
const sessionDuration = 60 * 60 * 24 * 14;

// Jedyne konto administratora. W repozytorium jest tylko hash hasła (scrypt), nie samo hasło.
const ADMIN_EMAIL = 'anka@swiatczeka.pl';
const ADMIN_SALT = Buffer.from('5ca3df132f58d273dafd1e3f1c8887a7', 'hex');
const ADMIN_HASH = Buffer.from('3299aecc0fbef5c4ab546907877815075deaedbf87d86d6d5a21f35a7bce090b', 'hex');

function sessionSecret() {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 32) return explicit;
  // Bez SESSION_SECRET używamy sekretu pochodnego od tokenu Vercel Blob (niedostępnego w repozytorium).
  const fallback = process.env.BLOB_READ_WRITE_TOKEN;
  if (fallback) return createHash('sha256').update(`swiatczeka-session:${fallback}`).digest('hex');
  throw new Error('Brak SESSION_SECRET.');
}

function signature(payload: string) {
  const secret = sessionSecret();
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin() {
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return false;
  const [expiresAt, nonce, providedSignature] = value.split('.');
  if (!expiresAt || !nonce || !providedSignature || Number(expiresAt) < Date.now()) return false;
  try {
    return safeEqual(signature(`${expiresAt}.${nonce}`), providedSignature);
  } catch {
    return false;
  }
}

export function verifyCredentials(email: string, password: string) {
  const emailOk = safeEqual(email.trim().toLowerCase(), ADMIN_EMAIL);
  const hash = scryptSync(password, ADMIN_SALT, ADMIN_HASH.length);
  return timingSafeEqual(hash, ADMIN_HASH) && emailOk;
}

export async function createAdminSession() {
  const expiresAt = Date.now() + sessionDuration * 1000;
  const nonce = randomBytes(18).toString('base64url');
  const payload = `${expiresAt}.${nonce}`;
  (await cookies()).set(cookieName, `${payload}.${signature(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: sessionDuration,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(cookieName);
}