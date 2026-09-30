import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { recordView } from '@/lib/stats';

export const runtime = 'nodejs';

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|monitor|curl|wget/i;

export async function POST(request: Request) {
  const path = String((await request.json().catch(() => ({}))).path ?? '');
  if (!/^\/(?:$|[a-z0-9\-_/%]*$)/i.test(path) || path.length > 200 || /^\/(studio|api)/.test(path)) return new NextResponse(null, { status: 204 });
  if (BOT.test(request.headers.get('user-agent') ?? '') || (await isAdmin())) return new NextResponse(null, { status: 204 });
  try {
    await recordView(path.length > 1 ? path.replace(/\/$/, '') : path);
  } catch (error) {
    console.error('Could not record page view.', error);
  }
  return new NextResponse(null, { status: 204 });
}
