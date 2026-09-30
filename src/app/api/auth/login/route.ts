import { NextResponse } from 'next/server';
import { createAdminSession, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({}));
  if (typeof password !== 'string' || !verifyPassword(password)) {
    return NextResponse.json({ error: 'Hasło jest nieprawidłowe.' }, { status: 401 });
  }
  try {
    await createAdminSession();
  } catch {
    return NextResponse.json({ error: 'Brakuje konfiguracji bezpiecznej sesji.' }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}