'use client';

import Link from 'next/link';
import { useState, type MouseEvent, type ReactNode } from 'react';

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

  // Na widoku całego świata kliknięcie kraju przybliża jego kontynent; dopiero w przybliżeniu prowadzi do wpisów.
  function onMapClick(event: MouseEvent<SVGSVGElement>) {
    if (region !== 'all') return;
    const link = (event.target as Element).closest('a[data-continent]');
    const continent = link?.getAttribute('data-continent');
    if (!continent) return;
    event.preventDefault();
    event.stopPropagation();
    setRegion(continent);
  }

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
      <p className="map-hint">{region === 'all' ? 'Dotknij kraju lub wybierz kontynent, żeby przybliżyć mapę.' : 'Dotknij podświetlonego kraju, żeby zobaczyć historie stamtąd.'}</p>
      <svg onClickCapture={onMapClick} viewBox={`${x} ${y} ${w} ${h}`} role="group" aria-label="Mapa świata z odwiedzonymi krajami" preserveAspectRatio="xMidYMid meet" style={{ aspectRatio: `${w} / ${h}` }}>
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
