import Link from 'next/link';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-50m.json';
import { MapFrame, type MapRegion, type MapCountry } from '@/components/map-frame';
import { continents, countryCategories, regionBounds } from '@/lib/countries';

const WIDTH = 1000;
const HEIGHT = 520;

type Shape = { id: string; name: string; d: string };
type Geometry2 = { shapes: Shape[]; regions: MapRegion[] };

let cache: Geometry2 | undefined;

function build(): Geometry2 {
  if (cache) return cache;
  const topology = world as unknown as Topology;
  const collection = feature(topology, topology.objects.countries as GeometryCollection) as FeatureCollection<Geometry, { name: string }>;
  const land = collection.features.filter((country) => country.properties.name !== 'Antarctica');
  const projection = geoNaturalEarth1().fitExtent([[6, 6], [WIDTH - 6, HEIGHT - 6]], { type: 'FeatureCollection', features: land } as FeatureCollection);
  const path = geoPath(projection).digits(1);
  const shapes = land.flatMap((country: Feature<Geometry, { name: string }>, index) => {
    const d = path(country);
    return d ? [{ id: String(country.id ?? index), name: country.properties.name, d }] : [];
  });

  const regions: MapRegion[] = [{ slug: 'all', label: 'Cały świat', view: [0, 0, WIDTH, HEIGHT] }];
  for (const continent of continents) {
    const bounds = regionBounds[continent.slug];
    if (!bounds) continue;
    const [west, south, east, north] = bounds;
    const points: [number, number][] = [];
    for (let i = 0; i <= 4; i += 1) for (const lat of [south, north]) points.push([west + ((east - west) * i) / 4, lat]);
    for (let i = 0; i <= 4; i += 1) for (const lon of [west, east]) points.push([lon, south + ((north - south) * i) / 4]);
    const projected = points.map((point) => projection(point)).filter((point): point is [number, number] => Boolean(point));
    const xs = projected.map((point) => point[0]);
    const ys = projected.map((point) => point[1]);
    const pad = 12;
    const x = Math.min(...xs) - pad;
    const y = Math.min(...ys) - pad;
    regions.push({ slug: continent.slug, label: continent.label, view: [x, y, Math.max(...xs) + pad - x, Math.max(...ys) + pad - y] });
  }
  cache = { shapes, regions };
  return cache;
}

export function WorldMap({ counts, openPicker = false }: { counts: Map<string, number>; openPicker?: boolean }) {
  const { shapes, regions } = build();
  const visited: MapCountry[] = Object.entries(countryCategories)
    .map(([name, info]) => ({ name, slug: info.slug, label: info.label, continent: info.continent, count: counts.get(info.slug) ?? 0 }))
    .filter((country) => country.count > 0)
    .sort((a, b) => b.count - a.count);
  const bySlug = new Map(visited.map((country) => [country.name, country]));
  const max = Math.max(1, ...visited.map((country) => country.count));
  const shade = (count: number) => (count > max * 0.4 ? 3 : count > max * 0.1 ? 2 : 1);
  const regionCounts = Object.fromEntries(regions.map((region) => [region.slug, region.slug === 'all' ? visited.length : visited.filter((country) => country.continent === region.slug).length]));

  return (
    <MapFrame regions={regions} countries={visited} regionCounts={regionCounts} openPicker={openPicker}>
      {shapes.map((shape) => {
        const hit = bySlug.get(shape.name);
        if (!hit) return <path key={shape.id} className="map-country" d={shape.d} />;
        return (
          <Link key={shape.id} href={`/kategoria/${hit.slug}`} aria-label={`${hit.label} — ${hit.count} ${hit.count === 1 ? 'wpis' : 'wpisów'}`}>
            <path className={`map-country map-visited map-shade-${shade(hit.count)}`} d={shape.d}><title>{`${hit.label} · ${hit.count}`}</title></path>
          </Link>
        );
      })}
    </MapFrame>
  );
}
