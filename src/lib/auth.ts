import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const cookieName = 'swiatczeka_session';
const sessionDuration = 60 * 60 * 24 * 14;

function signature(payload: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters.');
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

export function verifyPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(password, expected);
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