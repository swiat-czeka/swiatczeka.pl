import { list } from '@vercel/blob';
import { cache } from 'react';
import { continents } from '@/lib/countries';
import legacyPages from '@/data/legacy-pages.json';
import legacyPosts from '@/data/legacy-posts.json';
import { imageSources, isIncomplete } from '@/lib/legacy';
import type { BlogPost, PostPreview } from '@/lib/types';

const legacy = legacyPosts as BlogPost[];

async function getBlobDocuments(prefix: 'posts/' | 'pages/'): Promise<BlogPost[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const records: BlogPost[] = [];
    let cursor: string | undefined;
    do {
      const result = await list({ prefix, cursor, limit: 1000 });
      const batch = await Promise.all(result.blobs.map(async (blob) => {
        try {
          const response = await fetch(blob.url, { cache: 'no-store' });
          if (!response.ok) return null;
          return await response.json() as BlogPost;
        } catch {
          return null;
        }
      }));
      records.push(...batch.filter((post): post is BlogPost => Boolean(post)));
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);
    return records;
  } catch (error) {
    console.error(`Could not read ${prefix} documents from Vercel Blob.`, error);
    return [];
  }
}

function withStatus(post: BlogPost): BlogPost {
  return { ...post, author: 'Anka', status: isIncomplete(post) ? 'draft' : 'published' };
}

/** Wszystkie wpisy (także drafty) — tylko dla panelu administratora. Dokument z Blob o tym samym adresie zastępuje wpis z archiwum. */
export const getAllPosts = cache(async function getAllPosts() {
  const live = await getBlobDocuments('posts/');
  const liveSlugs = new Set(live.map((post) => post.slug));
  return [...live, ...legacy.filter((post) => !liveSlugs.has(post.slug))]
    .map(withStatus)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
});

export const getPosts = cache(async function getPosts() {
  return (await getAllPosts()).filter((post) => post.status !== 'draft');
});

/** Liczba wszystkich historii, także jeszcze nieopublikowanych (do liczników na stronie). */
export async function getTotalCount() {
  return (await getAllPosts()).length;
}

export async function getDrafts() {
  return (await getAllPosts()).filter((post) => post.status === 'draft');
}

/** Strony: utworzone w studiu (Blob) oraz zaimportowane podstrony WordPressa (O nas, Dokąd dalej?, polityka cookies). */
export const getPages = cache(async function getPages() {
  const live = await getBlobDocuments('pages/');
  const liveSlugs = new Set(live.map((page) => page.slug));
  const imported: BlogPost[] = legacyPages
    .filter((page) => !liveSlugs.has(page.slug))
    .map((page) => ({ id: `page-${page.slug}`, slug: page.slug, title: page.title, date: '2026-09-27T00:00:00.000Z', author: 'Anka', excerpt: '', content: page.content, format: 'html', image: '', imageAlt: page.title, categories: [], tags: [] }));
  return [...live, ...imported];
});

export function toPreview(post: BlogPost): PostPreview {
  const { id, slug, title, date, author, excerpt, imageAlt, categories } = post;
  const { src, fallback } = imageSources(post);
  return { id, slug, title, date, author, excerpt: excerpt.slice(0, 220), image: src, imageFallback: fallback, imageAlt, categories };
}

export async function getPostBySlug(slug: string) {
  return (await getPosts()).find((post) => post.slug === slug);
}

export async function getPageBySlug(slug: string) {
  return (await getPages()).find((page) => page.slug === slug);
}

export type SortOrder = 'newest' | 'oldest' | 'title';

export async function getArchivePage(search: string, category: string, offset: number, limit: number, sort: SortOrder = 'newest') {
  const posts = await getPosts();
  const query = search.toLocaleLowerCase('pl');
  const filtered = posts.filter((post) => {
    const matchesQuery = !query || `${post.title} ${post.excerpt} ${post.categories.map((term) => term.name).join(' ')}`.toLocaleLowerCase('pl').includes(query);
    const matchesCategory = !category || post.categories.some((term) => term.slug === category);
    return matchesQuery && matchesCategory;
  });
  if (sort === 'oldest') filtered.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  if (sort === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title, 'pl'));
  return {
    posts: filtered.slice(offset, offset + limit).map(toPreview),
    total: filtered.length,
    hasMore: offset + limit < filtered.length,
  };
}

export async function getCategoryCounts() {
  const counts = new Map<string, { name: string; slug: string; count: number }>();
  for (const post of await getPosts()) {
    for (const term of post.categories) {
      const current = counts.get(term.slug);
      counts.set(term.slug, { ...term, count: (current?.count ?? 0) + 1 });
    }
  }
  return counts;
}

export async function getPopularCategories() {
  return [...(await getCategoryCounts()).values()].sort((a, b) => b.count - a.count).slice(0, 12);
}

export async function getAdjacentPosts(slug: string) {
  const posts = await getPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index < 0) return { newer: undefined, older: undefined };
  return { newer: posts[index - 1], older: posts[index + 1] };
}

export async function getRelatedPosts(post: BlogPost, limit = 3) {
  const slugs = new Set(post.categories.map((category) => category.slug).filter((slug) => !['dokad-teraz', 'azja', 'afryka', 'europa', 'fotki', 'filmy'].includes(slug)));
  const posts = await getPosts();
  return posts.filter((other) => other.slug !== post.slug && other.image && other.categories.some((category) => slugs.has(category.slug))).slice(0, limit);
}

/** Kontynenty z liczbą opublikowanych wpisów (tylko te, w których coś jest). */
export async function getContinents() {
  const counts = await getCategoryCounts();
  return continents
    .map((continent) => ({ name: continent.label, slug: continent.slug, count: counts.get(continent.slug)?.count ?? 0 }))
    .filter((continent) => continent.count > 0);
}
