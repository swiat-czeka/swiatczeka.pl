import { NextResponse } from 'next/server';
import { getArchivePage } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const offset = Math.max(0, Number.parseInt(url.searchParams.get('offset') ?? '0', 10) || 0);
  const result = await getArchivePage(
    url.searchParams.get('q') ?? '',
    url.searchParams.get('category') ?? '',
    offset,
    12,
  );
  return NextResponse.json(result, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}