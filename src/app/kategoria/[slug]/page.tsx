import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ArchiveBrowser } from '@/components/archive-browser';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getArchivePage, getContinents, getPosts } from '@/lib/posts';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = (await getPosts()).flatMap((post) => post.categories).find((category) => category.slug === slug)?.name ?? slug.replaceAll('-', ' ');
  return {
    title: `${name} — podróże i historie`,
    description: `Nasze historie, zdjęcia i wskazówki z podróży: ${name}. Prawdziwe relacje z drogi z bloga Świat Czeka.`,
    alternates: { canonical: `/kategoria/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const allPosts = await getPosts();
  const posts = allPosts.filter((post) => post.categories.some((category) => category.slug === slug));
  if (!posts.length) notFound();
  const name = posts[0].categories.find((category) => category.slug === slug)?.name ?? slug;
  const [archive, categories] = await Promise.all([
    getArchivePage('', slug, 0, 12),
    getContinents(),
  ]);
  return (
    <>
      <SiteHeader />
      <main className="category-page" id="top">
        <Link className="back-link" href="/#kierunki"><ArrowLeft size={16} /> Wszystkie kierunki</Link>
        <p className="section-label">Historie z podróży</p><h1>{name}<em>.</em></h1><p className="category-intro">{posts.length} {posts.length === 1 ? 'opowieść' : 'opowieści'} z tego miejsca. Każda zaczyna się od drogi.</p>
        <ArchiveBrowser initialPosts={archive.posts} categories={categories} total={archive.total} initialCategory={slug} />
      </main>
      <SiteFooter />
    </>
  );
}