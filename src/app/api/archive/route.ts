import { NextResponse } from 'next/server';
import { getArchivePage, type SortOrder } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const offset = Math.max(0, Number.parseInt(url.searchParams.get('offset') ?? '0', 10) || 0);
  const result = await getArchivePage(
    url.searchParams.get('q') ?? '',
    url.searchParams.get('category') ?? '',
    offset,
    12,
    (['newest', 'oldest', 'title'] as const).includes(url.searchParams.get('sort') as SortOrder) ? url.searchParams.get('sort') as SortOrder : 'newest',
  );
  return NextResponse.json(result, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}