import type { MetadataRoute } from 'next';
import { getPages, getPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages] = await Promise.all([getPosts(), getPages()]);
  return [
    { url: 'https://swiatczeka.pl', changeFrequency: 'daily', priority: 1 },
    ...posts.map((post) => ({ url: `https://swiatczeka.pl/wpis/${post.slug}`, lastModified: new Date(post.modified || post.date), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...pages.map((page) => ({ url: `https://swiatczeka.pl/strona/${page.slug}`, lastModified: new Date(page.date), changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}