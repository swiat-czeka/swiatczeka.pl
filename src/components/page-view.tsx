import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { PostCard } from '@/components/post-card';
import { SmartImage } from '@/components/smart-image';
import { SocialLinks } from '@/components/social-links';
import { imageSources, mirrorUrl, rewriteLegacyHtml } from '@/lib/legacy';
import { getArchivePage } from '@/lib/posts';
import { achievements, wonders } from '@/lib/achievements';
import { contact, people } from '@/lib/site';
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
          <section className="people" aria-labelledby="people-title">
            <h2 id="people-title">Kim jesteśmy</h2>
            <div className="people-grid">
              {people.map((person) => (
                <article key={person.name} className="person-card">
                  <div className="person-photo"><SmartImage src={mirrorUrl(person.photo)} alt={`${person.name}, zdjęcie`} fill sizes="(max-width: 620px) 70vw, 220px" quality={80} /></div>
                  <h3>{person.name}</h3>
                  {person.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </article>
              ))}
            </div>
          </section>
        )}
        {page.slug === 'klub' && (
          <section className="wins" aria-labelledby="wins-title">
            <h2 id="wins-title">Nasze małe sukcesy</h2>
            <p className="wins-lead">Trasy, które przeszliśmy i przejechaliśmy, oraz cuda świata, które udało się zobaczyć.</p>
            {[...achievements, ...wonders].map((group) => (
              <div key={group.title} className="wins-group">
                <h3>{group.title} <span>{group.summary}</span></h3>
                <ul className="wins-grid">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <div className={`wins-photo${item.image ? '' : ' wins-photo-logo'}`}>
                        {item.image
                          ? <Image src={item.image} alt={item.name} fill sizes="(max-width: 620px) 92vw, (max-width: 1000px) 46vw, 300px" quality={78} />
                          : <Image src="/swiatczeka-logo.png" alt="Świat Czeka" width={220} height={110} sizes="160px" />}
                      </div>
                      <strong>{item.name}</strong>
                      <span className="wins-meta">{item.when}{item.km ? ` · ${item.km} km` : ''}</span>
                      {item.note && <span className="wins-note">{item.note}</span>}
                      {item.href && <a className="text-link" href={item.href} target="_blank" rel="noopener noreferrer">{item.hrefLabel ?? 'Zdjęcia z trasy'} <ArrowUpRight size={14} /></a>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
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
        {!html && <Link className="landing-cta" href="/mapa#historie">Odkryj wszystkie historie <ArrowUpRight size={17} /></Link>}
      </article>
    </main>
  );
}
