import { NextResponse } from 'next/server';
import { createAdminSession, verifyCredentials } from '@/lib/auth';

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (typeof email !== 'string' || typeof password !== 'string' || password.length > 200 || !verifyCredentials(email, password)) {
    return NextResponse.json({ error: 'Nieprawidłowy e-mail lub hasło.' }, { status: 401 });
  }
  try {
    await createAdminSession();
  } catch {
    return NextResponse.json({ error: 'Brakuje konfiguracji sesji (SESSION_SECRET lub magazyn Blob).' }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
