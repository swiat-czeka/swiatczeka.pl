import Link from 'next/link';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-50m.json';
import { countryCategories } from '@/lib/countries';

const WIDTH = 1000;
const HEIGHT = 520;

type Country = { id: string; name: string; d: string };

let shapes: Country[] | undefined;

function getShapes(): Country[] {
  if (shapes) return shapes;
  const topology = world as unknown as Topology;
  const collection = feature(topology, topology.objects.countries as GeometryCollection) as FeatureCollection<Geometry, { name: string }>;
  const land = collection.features.filter((country) => country.properties.name !== 'Antarctica');
  const projection = geoNaturalEarth1().fitExtent([[6, 6], [WIDTH - 6, HEIGHT - 6]], { type: 'FeatureCollection', features: land } as FeatureCollection);
  const path = geoPath(projection);
  shapes = land.flatMap((country: Feature<Geometry, { name: string }>, index) => {
    const d = path(country);
    return d ? [{ id: String(country.id ?? index), name: country.properties.name, d }] : [];
  });
  return shapes;
}

export function WorldMap({ counts }: { counts: Map<string, number> }) {
  const visited = Object.entries(countryCategories)
    .map(([name, info]) => ({ name, ...info, count: counts.get(info.slug) ?? 0 }))
    .filter((country) => country.count > 0)
    .sort((a, b) => b.count - a.count);
  const bySlug = new Map(visited.map((country) => [country.name, country]));
  const max = Math.max(1, ...visited.map((country) => country.count));
  const shade = (count: number) => (count > max * 0.4 ? 3 : count > max * 0.1 ? 2 : 1);

  return (
    <div className="world-map">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="group" aria-label="Mapa świata z odwiedzonymi krajami" preserveAspectRatio="xMidYMid meet">
        {getShapes().map((country) => {
          const hit = bySlug.get(country.name);
          if (!hit) return <path key={country.id} className="map-country" d={country.d} />;
          return (
            <Link key={country.id} href={`/kategoria/${hit.slug}`} aria-label={`${hit.label} — ${hit.count} ${hit.count === 1 ? 'wpis' : 'wpisów'}`}>
              <path className={`map-country map-visited map-shade-${shade(hit.count)}`} d={country.d}><title>{`${hit.label} · ${hit.count}`}</title></path>
            </Link>
          );
        })}
      </svg>
      <ul className="map-legend" aria-label="Odwiedzone kraje">
        {visited.map((country) => (
          <li key={country.slug}><Link href={`/kategoria/${country.slug}`}>{country.label}<span>{country.count}</span></Link></li>
        ))}
      </ul>
    </div>
  );
}
