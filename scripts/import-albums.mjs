// Pobiera albumy z działu „Fotki” (portfolio) starego WordPressa: okładka, zdjęcia i link do albumu Google Photos.
// Uruchom: npm run import:albums
import { writeFile } from 'node:fs/promises';

const SITE = 'https://czekaswiat.pl';
const decode = (text) => text.replace(/&#8211;/g, '–').replace(/&#8212;/g, '—').replace(/&#8222;|&#8221;|&#8220;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#038;/g, '&').replace(/&#8217;/g, '’');
// Ten sam plik w różnych wariantach (miniatura -400x400, -scaled, -optimized, -rotated) to jedno zdjęcie.
const key = (url) => {
  let name = decodeURIComponent(url.split('/').pop() ?? '').toLowerCase().replace(/\.[a-z0-9]+$/, '');
  for (let i = 0; i < 4; i += 1) name = name.replace(/-(?:scaled|optimized|rotated|e\d{9,})$/, '').replace(/-\d{2,4}x\d{2,5}$/, '');
  return name;
};
const isThumbnail = (url) => /-\d{2,4}x\d{2,5}(?:-optimized)?\.[a-z]+$/i.test(url);

const albums = [];
for (let page = 1; ; page += 1) {
  const response = await fetch(`${SITE}/wp-json/wp/v2/portfolio?per_page=50&page=${page}&_embed=wp:featuredmedia`);
  if (!response.ok) break;
  const items = await response.json();
  for (const item of items) {
    const html = item.content?.rendered ?? '';
    const google = html.match(/href="(https?:\/\/(?:photos\.google\.com|photos\.app\.goo\.gl|goo\.gl\/photos|get\.google\.com\/albumarchive)[^"]*)"/)?.[1];
    const seen = new Map();
    const photos = [];
    for (const match of html.matchAll(/(?:href|src)="(https?:\/\/[^"]*\/wp-content\/uploads\/[^"]+\.(?:jpe?g|png|webp))"/gi)) {
      const url = match[1].replace(/^http:/, 'https:').replace(/^https:\/\/(?:www\.)?swiatczeka\.pl/, SITE);
      const id = key(url);
      const index = seen.get(id);
      if (index === undefined) { seen.set(id, photos.length); photos.push(url); }
      else if (isThumbnail(photos[index]) && !isThumbnail(url)) photos[index] = url; // wariant w pełnym rozmiarze zamiast miniatury
    }
    const cover = item._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? photos[0] ?? '';
    albums.push({
      slug: item.slug,
      title: decode(item.title?.rendered ?? item.slug).trim(),
      date: item.date,
      cover,
      photos: photos.filter((url) => key(url) !== key(cover)),
      google,
    });
  }
  if (items.length < 50) break;
}

albums.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
await writeFile('src/data/albums.json', `${JSON.stringify(albums)}\n`);
console.log(`Zapisano ${albums.length} albumów (${albums.filter((album) => album.google).length} z linkiem Google Photos, ${albums.reduce((sum, album) => sum + album.photos.length, 0)} dodatkowych zdjęć).`);
