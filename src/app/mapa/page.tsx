import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { WorldMap } from '@/components/world-map';
import { getCategoryCounts } from '@/lib/posts';
import { countryCategories } from '@/lib/countries';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Mapa naszych podróży',
  description: 'Zdrapka świata: kraje, w których byliśmy, podświetlone na zielono. Kliknij kraj, żeby przeczytać nasze historie stamtąd.',
  alternates: { canonical: '/mapa' },
};

export default async function MapPage() {
  const counts = await getCategoryCounts();
  const slugCounts = new Map([...counts].map(([slug, category]) => [slug, category.count]));
  const visited = Object.values(countryCategories).filter((country) => (slugCounts.get(country.slug) ?? 0) > 0).length;
  return (
    <>
      <SiteHeader />
      <main className="map-page" id="top">
        <p className="section-label">Zdrapka świata</p>
        <h1>Gdzie już <em>byliśmy.</em></h1>
        <p className="category-intro">{visited} krajów zdrapanych z szarej mapy. Kliknij zielony kraj, żeby przeczytać historie stamtąd.</p>
        <WorldMap counts={slugCounts} openPicker />
      </main>
      <SiteFooter />
    </>
  );
}
