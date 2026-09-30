import Link from 'next/link';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { PostCard } from '@/components/post-card';
import { SmartImage } from '@/components/smart-image';
import { SocialLinks } from '@/components/social-links';
import { imageSources, rewriteLegacyHtml } from '@/lib/legacy';
import { getArchivePage } from '@/lib/posts';
import { contact } from '@/lib/site';
import type { BlogPost } from '@/lib/types';

/** Strona statyczna: zaimportowana z WordPressa (HTML) albo utworzona w studiu (tekst z `## nagłówkami`). */
export async function PageView({ page }: { page: BlogPost }) {
  const html = page.format === 'html';
  const cover = page.image ? imageSources(page) : undefined;
  const latest = page.slug === 'dokad-dalej' ? (await getArchivePage('', 'dokad-teraz', 0, 6)).posts : [];
  return (
    <main className="landing-page" id="top">
      <header className="landing-heading">
        <span className="section-label">Świat czeka</span>
        <h1>{page.title}</h1>
        {page.excerpt && <p>{page.excerpt}</p>}
      </header>
      {cover && <figure className="landing-cover"><SmartImage src={cover.src} alt={page.imageAlt || page.title} fill priority quality={85} sizes="100vw" /></figure>}
      <article className={`landing-content${html ? ' page-html' : ''}`} id="opowiesc">
        {html
          ? <div dangerouslySetInnerHTML={{ __html: rewriteLegacyHtml(page.content) }} />
          : page.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => paragraph.startsWith('## ') ? <h2 key={index}>{paragraph.slice(3)}</h2> : <p key={index}>{paragraph}</p>)}
        {page.slug === 'klub' && (
          <div className="contact-card">
            <h2>Napisz lub zadzwoń</h2>
            <p><a href={`mailto:${contact.email}`}><Mail size={16} /> {contact.email}</a></p>
            <p><a href={`tel:${contact.phone}`}><Phone size={16} /> {contact.phoneLabel}</a></p>
            <SocialLinks />
          </div>
        )}
        {latest.length > 0 && (
          <div className="page-posts">
            <h2>Najnowsze z trasy</h2>
            <div className="post-grid">{latest.map((post, index) => <PostCard key={post.id} post={post} index={index} />)}</div>
            <Link className="landing-cta" href="/kategoria/dokad-teraz">Wszystkie wpisy z trasy <ArrowUpRight size={17} /></Link>
          </div>
        )}
        {!html && <Link className="landing-cta" href="/#historie">Odkryj wszystkie historie <ArrowUpRight size={17} /></Link>}
      </article>
    </main>
  );
}
