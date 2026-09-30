import type { MetadataRoute } from 'next';
import { getCategoryCounts, getPages, getPosts } from '@/lib/posts';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages, categories] = await Promise.all([getPosts(), getPages(), getCategoryCounts()]);
  return [
    { url: 'https://swiatczeka.pl', changeFrequency: 'daily', priority: 1 },
    { url: 'https://swiatczeka.pl/mapa', changeFrequency: 'weekly', priority: 0.8 },
    ...[...categories.keys()].map((slug) => ({ url: `https://swiatczeka.pl/kategoria/${slug}`, changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...posts.map((post) => ({ url: `https://swiatczeka.pl/${post.slug}`, lastModified: new Date(post.modified || post.date), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...pages.map((page) => ({ url: `https://swiatczeka.pl/${page.slug}`, lastModified: new Date(page.date), changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
