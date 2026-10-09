import type { Metadata } from 'next';
import { ArchiveBrowser } from '@/components/archive-browser';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { WorldMap } from '@/components/world-map';
import { countryCategories } from '@/lib/countries';
import { getArchivePage, getCategoryCounts, getContinents, getPosts, getTotalCount } from '@/lib/posts';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Nasze podróże: mapa i wszystkie historie',
  description: 'Prywatny dziennik z drogi: mapa świata z odwiedzonymi krajami i wszystkie historie z naszych podróży, od 2005 roku.',
  alternates: { canonical: '/mapa' },
};

export default async function TravelsPage() {
  const [counts, posts, archive, continents, total] = await Promise.all([getCategoryCounts(), getPosts(), getArchivePage('', '', 0, 12), getContinents(), getTotalCount()]);
  const slugCounts = new Map([...counts].map(([slug, category]) => [slug, category.count]));
  const countries = Object.values(countryCategories).filter((country) => (slugCounts.get(country.slug) ?? 0) > 0).length;
  return (
    <>
      <SiteHeader />
      <main className="map-page" id="top">
        <p className="section-label">Nasze podróże</p>
        <h1>Prywatny dziennik <em>z drogi.</em></h1>
        <div className="travels-intro">
          <p>Świat czeka! Ty decydujesz! Rozbijamy stereotypy podróży i pokazujemy, że podróżowanie z Polski do egzotycznych miejsc jest bardziej dostępne, niż się wydaje. Od 2005 roku zapisujemy tu prawdziwe historie z drogi: {total.toLocaleString('pl-PL')} opowieści z {countries} krajów.</p>
          <p>Szukasz konkretnego kraju? Kliknij go na mapie albo przejrzyj wszystkie historie poniżej.</p>
        </div>

        <section className="travels-map" aria-labelledby="map-title">
          <h2 id="map-title">Gdzie już <em>byliśmy.</em></h2>
          <WorldMap counts={slugCounts} openPicker />
        </section>

        <section className="travels-blog" id="historie" aria-labelledby="blog-title">
          <div className="section-heading"><div><span className="section-label">Z drogi, z serca</span><h2 id="blog-title">Historie, które <em>zostają.</em></h2></div><span className="archive-total">{total.toLocaleString('pl-PL')} opowieści, {posts.length.toLocaleString('pl-PL')} już online</span></div>
          <ArchiveBrowser initialPosts={archive.posts} categories={continents} total={archive.total} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
