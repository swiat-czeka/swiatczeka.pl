import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { formatDate } from '@/components/post-card';
import { getPostBySlug } from '@/lib/posts';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: post.image ? [post.image] : [] },
  };
}

export default async function StoryPage({ params }: Props) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();
  const legacy = !post.id.startsWith('new-');
  return (
    <>
      <SiteHeader />
      <main className="story-page" id="top">
        <div className="story-topline"><Link href="/#historie"><ArrowLeft size={16} /> Wszystkie historie</Link><span>{post.categories[0]?.name}</span></div>
        <header className="story-header">
          <div className="story-meta"><span>{post.categories[0]?.name ?? 'Dziennik z drogi'}</span><span>·</span><time dateTime={post.date}>{formatDate(post.date)}</time></div>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="story-lead">{post.excerpt}</p>}
          <div className="story-byline"><span className="byline-avatar">{post.author.slice(0, 1)}</span><span>Opowiada <strong>{post.author}</strong></span><span className="story-reading">Świat czeka. Bez pośpiechu.</span></div>
        </header>
        {post.image && <figure className="story-cover"><Image src={post.image} alt={post.imageAlt || post.title} fill priority sizes="(max-width: 900px) 88vw, 76vw" /></figure>}
        <div className="story-layout">
          <aside className="story-aside"><span>Podróżuj z nami</span><div>{post.categories.map((category) => <Link key={category.slug} href={`/kategoria/${category.slug}`}>{category.name} <ArrowUpRight size={12} /></Link>)}</div></aside>
          <article className={`story-content${legacy ? ' legacy-content' : ''}`}>
            {legacy ? <div dangerouslySetInnerHTML={{ __html: post.content }} /> : post.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => paragraph.startsWith('## ') ? <h2 key={index}>{paragraph.slice(3)}</h2> : <p key={index}>{paragraph}</p>)}
            {post.gallery && post.gallery.length > 1 && <div className="story-gallery">{post.gallery.slice(1).map((image, index) => <Image key={image} src={image} alt={`${post.title}, zdjęcie ${index + 2}`} width={600} height={400} sizes="(max-width: 620px) 42vw, 30vw" loading="lazy" />)}</div>}
            <div className="story-end"><span>✳</span><p>Do zobaczenia<br /><em>gdzieś po drodze.</em></p></div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}