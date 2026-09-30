'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

export type MapRegion = { slug: string; label: string; view: [number, number, number, number] };
export type MapCountry = { name: string; slug: string; label: string; continent: string; count: number };

/** Mapa z przełącznikiem kontynentów: na telefonie od razu przybliża najbogatszy kontynent, żeby kraje dało się trafić palcem. */
export function MapFrame({ regions, countries, regionCounts, openPicker, children }: {
  regions: MapRegion[];
  countries: MapCountry[];
  regionCounts: Record<string, number>;
  openPicker: boolean;
  children: ReactNode;
}) {
  const [region, setRegion] = useState('all');
  const richest = regions.filter((item) => item.slug !== 'all').sort((a, b) => (regionCounts[b.slug] ?? 0) - (regionCounts[a.slug] ?? 0))[0]?.slug ?? 'all';

  useEffect(() => {
    if (window.matchMedia('(max-width: 700px)').matches) setRegion(richest);
  }, [richest]);

  const active = regions.find((item) => item.slug === region) ?? regions[0];
  const [x, y, w, h] = active.view;
  const list = region === 'all' ? countries : countries.filter((country) => country.continent === region);

  return (
    <div className="world-map">
      <div className="map-tabs" role="tablist" aria-label="Kontynent">
        {regions.map((item) => (regionCounts[item.slug] ?? 0) > 0 || item.slug === 'all' ? (
          <button key={item.slug} type="button" role="tab" aria-selected={region === item.slug} className={region === item.slug ? 'tab-active' : ''} onClick={() => setRegion(item.slug)}>
            {item.label}<span>{regionCounts[item.slug]}</span>
          </button>
        ) : null)}
      </div>
      <svg viewBox={`${x} ${y} ${w} ${h}`} role="group" aria-label="Mapa świata z odwiedzonymi krajami" preserveAspectRatio="xMidYMid meet" style={{ aspectRatio: `${w} / ${h}` }}>
        {children}
      </svg>
      <details className="map-picker" open={openPicker}>
        <summary>Wybierz kraj <span>{list.length}</span></summary>
        <ul aria-label="Odwiedzone kraje">
          {list.map((country) => (
            <li key={country.slug}><Link href={`/kategoria/${country.slug}`}>{country.label}<span>{country.count}</span></Link></li>
          ))}
        </ul>
      </details>
    </div>
  );
}
