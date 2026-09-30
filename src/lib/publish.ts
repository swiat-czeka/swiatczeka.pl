import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import type { BlogPost } from '@/lib/types';

export async function publishDocument(request: Request, collection: 'posts' | 'pages') {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Brak dostępu.' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Dodaj magazyn Vercel Blob w projekcie.' }, { status: 503 });

  const input = await request.json().catch(() => null);
  if (!input || typeof input.title !== 'string' || typeof input.content !== 'string' || !input.title.trim() || !input.content.trim()) {
    return NextResponse.json({ error: 'Wpis potrzebuje tytułu i treści.' }, { status: 400 });
  }

  const slug = String(input.slug ?? '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
  if (!slug) return NextResponse.json({ error: 'Nie udało się przygotować adresu.' }, { status: 400 });
  const categories = Array.isArray(input.categories)
    ? input.categories.filter((name: unknown): name is string => typeof name === 'string').slice(0, 5).map((name: string) => ({ name, slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-') }))
    : [];
  const post: BlogPost = {
    id: `new-${Date.now()}`,
    slug,
    title: input.title.trim().slice(0, 180),
    excerpt: String(input.excerpt ?? '').trim().slice(0, 360),
    content: String(input.content).slice(0, 30000),
    image: Array.isArray(input.gallery) ? String(input.gallery[0] ?? '') : '',
    imageAlt: input.title.trim().slice(0, 180),
    gallery: Array.isArray(input.gallery) ? input.gallery.filter((url: unknown): url is string => typeof url === 'string' && url.startsWith('https://')).slice(0, 12) : [],
    categories,
    tags: [],
    date: new Date().toISOString(),
    author: 'Anka',
  };

  await put(`${collection}/${slug}.json`, JSON.stringify(post), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json; charset=utf-8',
  });
  return NextResponse.json({ ok: true, slug });
}