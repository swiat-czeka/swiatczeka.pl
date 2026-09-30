import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPageBySlug } from '@/lib/posts';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug((await params).slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.excerpt,
    openGraph: { title: page.title, description: page.excerpt, images: page.image ? [page.image] : [] },
  };
}

export default async function LandingPage({ params }: Props) {
  const page = await getPageBySlug((await params).slug);
  if (!page) notFound();
  return (
    <>
      <SiteHeader />
      <main className="landing-page" id="top">
        <header className="landing-heading">
          <span className="section-label">Świat czeka · {new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(page.date))}</span>
          <h1>{page.title}</h1>
          {page.excerpt && <p>{page.excerpt}</p>}
          {page.image && <a className="landing-scroll" href="#opowiesc">Poznaj opowieść <ArrowDown size={15} /></a>}
        </header>
        {page.image && <figure className="landing-cover"><Image src={page.image} quality={85} alt={page.imageAlt || page.title} fill priority sizes="100vw" /></figure>}
        <article className="landing-content" id="opowiesc">
          {page.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => paragraph.startsWith('## ') ? <h2 key={index}>{paragraph.slice(3)}</h2> : <p key={index}>{paragraph}</p>)}
          {page.gallery && page.gallery.length > 1 && <div className="story-gallery">{page.gallery.slice(1).map((image, index) => <Image key={image} src={image} alt={`${page.title}, zdjęcie ${index + 2}`} width={800} height={560} sizes="(max-width: 620px) 88vw, 70vw" loading="lazy" />)}</div>}
          <Link className="landing-cta" href="/#historie">Odkryj wszystkie historie <ArrowUpRight size={17} /></Link>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}