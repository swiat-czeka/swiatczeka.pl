// Pobiera albumy z działu „Fotki” (portfolio) starego WordPressa: okładka, zdjęcia i link do albumu Google Photos.
// Uruchom: npm run import:albums
import { writeFile } from 'node:fs/promises';

const SITE = 'https://czekaswiat.pl';
const decode = (text) => text.replace(/&#8211;/g, '–').replace(/&#8212;/g, '—').replace(/&#8222;|&#8221;|&#8220;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#038;/g, '&').replace(/&#8217;/g, '’');
const key = (url) => decodeURIComponent(url.split('/').pop() ?? '').toLowerCase().replace(/\.[a-z]+$/, '').replace(/-(?:scaled|optimized)$/, '').replace(/-\d{2,4}x\d{2,5}$/, '');

const albums = [];
for (let page = 1; ; page += 1) {
  const response = await fetch(`${SITE}/wp-json/wp/v2/portfolio?per_page=50&page=${page}&_embed=wp:featuredmedia`);
  if (!response.ok) break;
  const items = await response.json();
  for (const item of items) {
    const html = item.content?.rendered ?? '';
    const google = html.match(/href="(https?:\/\/(?:photos\.google\.com|photos\.app\.goo\.gl|goo\.gl\/photos|get\.google\.com\/albumarchive)[^"]*)"/)?.[1];
    const seen = new Set();
    const photos = [];
    for (const match of html.matchAll(/(?:href|src)="(https?:\/\/[^"]*\/wp-content\/uploads\/[^"]+\.(?:jpe?g|png|webp))"/gi)) {
      const url = match[1].replace(/^http:/, 'https:').replace(/^https:\/\/(?:www\.)?swiatczeka\.pl/, SITE);
      const id = key(url);
      if (!seen.has(id)) { seen.add(id); photos.push(url); }
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
