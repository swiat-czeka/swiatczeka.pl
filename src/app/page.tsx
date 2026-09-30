import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { ArchiveBrowser } from '@/components/archive-browser';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getArchivePage, getPopularCategories, getPosts } from '@/lib/posts';

export const revalidate = 60;

export default async function HomePage() {
  const [posts, archive, categories] = await Promise.all([
    getPosts(),
    getArchivePage('', '', 0, 12),
    getPopularCategories(),
  ]);
  const featured = posts[0];
  const places = categories.filter((category) => !['azja', 'afryka', 'ameryka-poludniowa', 'ameryka-polnocna', 'europa', 'fotki', 'filmy', 'dokad-teraz'].includes(category.slug)).slice(0, 6);

  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          {featured?.image && <Image className="hero-image" src={featured.image} alt={featured.imageAlt || featured.title} fill priority sizes="100vw" />}
          <div className="hero-shade" />
          <div className="hero-inner">
            <div className="hero-kicker"><span className="kicker-dot" /> Dziennik podróży · od 2005</div>
            <h1 id="hero-title">Nie odkładaj<br />świata <em>na później.</em></h1>
            <p>Prawdziwe historie z drogi, spotkania i miejsca, do których chce się wracać.</p>
            <a className="hero-link" href="#historie">Odkrywaj historie <ArrowDown size={16} /></a>
          </div>
          {featured && <Link className="hero-caption" href={`/wpis/${featured.slug}`}><span>Najnowsza opowieść</span><strong>{featured.title}</strong><ArrowUpRight size={18} /></Link>}
          <span className="hero-index">01 — {posts.length.toLocaleString('pl-PL')}</span>
        </section>

        <section className="intro-band" id="kierunki">
          <p className="section-label">Świat czeka</p>
          <div className="intro-copy"><h2>Nie kolekcjonujemy<br /><em>miejsc. Zbieramy chwile.</em></h2><p>Zaczęło się od biletu w jedną stronę. Został dziennik pełen spotkań, smaków i dróg, którymi najchętniej pójdziemy jeszcze raz.</p></div>
          <div className="place-list">{places.map((place, index) => <Link key={place.slug} href={`/kategoria/${place.slug}`}><span>0{index + 1}</span>{place.name}<ArrowUpRight size={15} /></Link>)}</div>
        </section>

        <section className="stories-section" id="historie">
          <div className="section-heading"><div><span className="section-label">Z drogi, z serca</span><h2>Historie, które <em>zostają.</em></h2></div><span className="archive-total">{posts.length.toLocaleString('pl-PL')} opowieści</span></div>
          <ArchiveBrowser initialPosts={archive.posts} categories={categories.slice(0, 8)} total={archive.total} />
        </section>

        <section className="closing-note"><span className="closing-star">✳</span><p>Najlepszy plan podróży?<br /><em>Ten, który jeszcze może się zmienić.</em></p><span className="closing-signature">Anka & przyjaciele</span></section>
      </main>
      <SiteFooter />
    </>
  );
}