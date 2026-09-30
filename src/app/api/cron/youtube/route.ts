import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { syncYoutube } from '@/lib/youtube';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) return true;
  // Zapytania crona Vercela (synchronizacja publicznego RSS jest bezpieczna i idempotentna).
  if (request.headers.get('user-agent')?.startsWith('vercel-cron/')) return true;
  return isAdmin();
}

async function handle(request: Request) {
  if (!(await authorized(request))) return NextResponse.json({ error: 'Brak dostępu.' }, { status: 401 });
  const result = await syncYoutube();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}

export const GET = handle;
export const POST = handle;
