import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { RESERVED_SLUGS, slugify } from '@/lib/legacy';
import { getAllPosts, getCategoryCounts } from '@/lib/posts';
import type { BlogPost, PostStatus } from '@/lib/types';

const isString = (value: unknown): value is string => typeof value === 'string';

export async function categoriesFromNames(names: string[]) {
  const known = new Map<string, { name: string; slug: string }>();
  for (const category of (await getCategoryCounts()).values()) known.set(category.name.toLocaleLowerCase('pl'), category);
  return names.slice(0, 5).map((raw) => {
    const name = raw.trim().slice(0, 60);
    return known.get(name.toLocaleLowerCase('pl')) ?? { name, slug: slugify(name) };
  }).filter((category) => category.slug);
}

export async function savePost(post: BlogPost, collection: 'posts' | 'pages') {
  await put(`${collection}/${post.slug}.json`, JSON.stringify(post), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: 'application/json; charset=utf-8',
  });
  revalidatePath('/');
  revalidatePath('/mapa');
  revalidatePath('/sitemap.xml');
  revalidatePath(`/${post.slug}`);
  for (const category of post.categories) revalidatePath(`/kategoria/${category.slug}`);
}

export async function publishDocument(request: Request, collection: 'posts' | 'pages') {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Brak dostępu.' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Dodaj magazyn Vercel Blob w projekcie.' }, { status: 503 });

  const input = await request.json().catch(() => null);
  if (!input || !isString(input.title) || !isString(input.content) || !input.title.trim() || !input.content.trim()) {
    return NextResponse.json({ error: 'Wpis potrzebuje tytułu i treści.' }, { status: 400 });
  }

  const status: PostStatus = input.status === 'draft' ? 'draft' : 'published';
  const overwrite = input.overwrite === true;
  let slug = slugify(isString(input.slug) && input.slug.trim() ? input.slug : input.title);
  if (!slug) return NextResponse.json({ error: 'Nie udało się przygotować adresu.' }, { status: 400 });
  if (!overwrite) {
    const taken = new Set([...(await getAllPosts()).map((post) => post.slug), ...RESERVED_SLUGS]);
    const base = slug.slice(0, 74);
    for (let n = 2; taken.has(slug); n += 1) slug = `${base}-${n}`;
  }

  const gallery = Array.isArray(input.gallery) ? input.gallery.filter((url: unknown): url is string => isString(url) && url.startsWith('https://')).slice(0, 12) : [];
  const title = input.title.trim().slice(0, 180);
  const post: BlogPost = {
    id: isString(input.id) && input.id ? input.id : `new-${Date.now()}`,
    slug,
    title,
    excerpt: String(input.excerpt ?? '').trim().slice(0, 360),
    content: String(input.content).slice(0, 30000),
    format: 'text',
    status,
    image: gallery[0] ?? (isString(input.image) ? input.image : ''),
    imageAlt: title,
    gallery,
    categories: await categoriesFromNames(Array.isArray(input.categories) ? input.categories.filter(isString) : []),
    tags: [],
    date: isString(input.date) && !Number.isNaN(Date.parse(input.date)) ? input.date : new Date().toISOString(),
    modified: new Date().toISOString(),
    author: 'Anka',
    seoDescription: isString(input.seoDescription) ? input.seoDescription.trim().slice(0, 170) : undefined,
    instagram: isString(input.instagram) ? input.instagram.trim().slice(0, 2200) : undefined,
    youtubeId: isString(input.youtubeId) ? input.youtubeId : undefined,
  };

  await savePost(post, collection);
  return NextResponse.json({ ok: true, slug, status });
}
