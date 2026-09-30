import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ArchiveBrowser } from '@/components/archive-browser';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getArchivePage, getPopularCategories, getPosts } from '@/lib/posts';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug.replaceAll('-', ' ')} — nasze historie`, description: `Historie podróżnicze z kategorii ${slug.replaceAll('-', ' ')}.` };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const allPosts = await getPosts();
  const posts = allPosts.filter((post) => post.categories.some((category) => category.slug === slug));
  if (!posts.length) notFound();
  const name = posts[0].categories.find((category) => category.slug === slug)?.name ?? slug;
  const [archive, categories] = await Promise.all([
    getArchivePage('', slug, 0, 12),
    getPopularCategories(),
  ]);
  return (
    <>
      <SiteHeader />
      <main className="category-page" id="top">
        <Link className="back-link" href="/#kierunki"><ArrowLeft size={16} /> Wszystkie kierunki</Link>
        <p className="section-label">Historie z podróży</p><h1>{name}<em>.</em></h1><p className="category-intro">{posts.length} {posts.length === 1 ? 'opowieść' : 'opowieści'} z tego miejsca. Każda zaczyna się od drogi.</p>
        <ArchiveBrowser initialPosts={archive.posts} categories={categories.slice(0, 8)} total={archive.total} initialCategory={slug} />
      </main>
      <SiteFooter />
    </>
  );
}