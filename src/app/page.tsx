import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { ArchiveBrowser } from '@/components/archive-browser';
import { SmartImage } from '@/components/smart-image';
import { WorldMap } from '@/components/world-map';
import { countryCategories } from '@/lib/countries';
import { imageSources } from '@/lib/legacy';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getArchivePage, getCategoryCounts, getContinents, getPosts, getTotalCount } from '@/lib/posts';

export const revalidate = 60;

export default async function HomePage() {
  const [posts, archive, continentList, categoryCounts, totalStories] = await Promise.all([
    getPosts(),
    getArchivePage('', '', 0, 12),
    getContinents(),
    getCategoryCounts(),
    getTotalCount(),
  ]);
  const featured = posts.find((post) => post.image) ?? posts[0];
  const featuredImage = featured ? imageSources(featured) : undefined;
  const slugCounts = new Map([...categoryCounts].map(([slug, category]) => [slug, category.count]));
  const countries = Object.values(countryCategories).filter((country) => (slugCounts.get(country.slug) ?? 0) > 0).length;

  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          {featuredImage?.src && <SmartImage className="hero-image" src={featuredImage.src} fallback={featuredImage.fallback} alt={featured.imageAlt || featured.title} fill priority quality={85} sizes="100vw" />}
          <div className="hero-shade" />
          <div className="hero-inner">
            <div className="hero-kicker"><span className="kicker-dot" /> Dziennik podróży · od 2005</div>
            <h1 id="hero-title">Nie odkładaj<br />świata <em>na później.</em></h1>
            <p>Prawdziwe historie z drogi, spotkania i miejsca, do których chce się wracać.</p>
            <a className="hero-link" href="#historie">Odkrywaj historie <ArrowDown size={16} /></a>
          </div>
          {featured && <Link className="hero-caption" href={`/${featured.slug}`}><span>Najnowsza opowieść</span><strong>{featured.title}</strong><ArrowUpRight size={18} /></Link>}
          <span className="hero-index">01 — {totalStories.toLocaleString('pl-PL')}</span>
        </section>

        <section className="intro-band" id="kierunki">
          <p className="section-label">Świat czeka</p>
          <div className="intro-copy"><h2>Nie kolekcjonujemy<br /><em>miejsc. Zbieramy chwile.</em></h2><p>Zaczęło się od biletu w jedną stronę. Został dziennik pełen spotkań, smaków i dróg, którymi najchętniej pójdziemy jeszcze raz.</p></div>
          <div className="place-list">{continentList.map((place) => <Link key={place.slug} href={`/kategoria/${place.slug}`}>{place.name}<span>{place.count}</span><ArrowUpRight size={15} /></Link>)}</div>
        </section>

        <section className="about-section" id="o-blogu" aria-labelledby="about-title">
          <span className="section-label">O tym blogu</span>
          <div>
            <h2 id="about-title">Prywatny dziennik <em>z drogi.</em></h2>
            <p>Świat czeka! Ty decydujesz! Rozbijamy stereotypy podróży i pokazujemy, że podróżowanie z Polski do egzotycznych miejsc jest bardziej dostępne, niż się wydaje. Od 2005 roku zapisujemy tu prawdziwe historie z drogi: {totalStories.toLocaleString('pl-PL')} opowieści z {countries} krajów.</p>
            <p>Szukasz konkretnego kraju? Kliknij go na mapie poniżej albo przejrzyj archiwum. <Link className="text-link" href="/klub">Poznaj nas <span aria-hidden="true">↗</span></Link></p>
          </div>
        </section>

        <section className="map-section" id="mapa" aria-labelledby="map-title">
          <div className="section-heading"><div><span className="section-label">Zdrapka świata</span><h2 id="map-title">Gdzie już <em>byliśmy.</em></h2></div><Link className="text-link" href="/mapa">Otwórz mapę <span aria-hidden="true">↗</span></Link></div>
          <WorldMap counts={slugCounts} />
        </section>

        <section className="stories-section" id="historie">
          <div className="section-heading"><div><span className="section-label">Z drogi, z serca</span><h2>Historie, które <em>zostają.</em></h2></div><span className="archive-total">{totalStories.toLocaleString('pl-PL')} opowieści, {posts.length.toLocaleString('pl-PL')} już online</span></div>
          <ArchiveBrowser initialPosts={archive.posts} categories={continentList} total={archive.total} />
        </section>

        <section className="closing-note"><Link className="closing-star" href="/studio" aria-label="Panel administratora">✳</Link><p>Najlepszy plan podróży?<br /><em>Ten, który jeszcze może się zmienić.</em></p><span className="closing-signature">Anka & przyjaciele</span></section>
      </main>
      <SiteFooter />
    </>
  );
}