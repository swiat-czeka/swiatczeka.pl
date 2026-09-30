import { list } from '@vercel/blob';
import { cache } from 'react';
import legacyPosts from '@/data/legacy-posts.json';
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

export const getPosts = cache(async function getPosts() {
  const livePosts = await getBlobDocuments('posts/');
  return [...livePosts, ...legacy].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
});

export const getPages = cache(async function getPages() {
  return getBlobDocuments('pages/');
});

export function toPreview(post: BlogPost): PostPreview {
  const { id, slug, title, date, author, excerpt, image, imageAlt, categories } = post;
  return { id, slug, title, date, author, excerpt, image, imageAlt, categories };
}

export async function getPostBySlug(slug: string) {
  return (await getPosts()).find((post) => post.slug === slug);
}

export async function getPageBySlug(slug: string) {
  return (await getPages()).find((page) => page.slug === slug);
}

export async function getArchivePage(search: string, category: string, offset: number, limit: number) {
  const posts = await getPosts();
  const query = search.toLocaleLowerCase('pl');
  const filtered = posts.filter((post) => {
    const matchesQuery = !query || `${post.title} ${post.excerpt} ${post.categories.map((term) => term.name).join(' ')}`.toLocaleLowerCase('pl').includes(query);
    const matchesCategory = !category || post.categories.some((term) => term.slug === category);
    return matchesQuery && matchesCategory;
  });
  return {
    posts: filtered.slice(offset, offset + limit).map(toPreview),
    total: filtered.length,
    hasMore: offset + limit < filtered.length,
  };
}

export async function getPopularCategories() {
  const counts = new Map<string, { name: string; slug: string; count: number }>();
  for (const post of await getPosts()) {
    for (const term of post.categories) {
      const current = counts.get(term.slug);
      counts.set(term.slug, { ...term, count: (current?.count ?? 0) + 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 12);
}