// Dodaje na stronę „Fotki” udostępnione albumy Google Photos z pliku scripts/google-album-links.txt:
// okładka albumu, tytuł albumu i 10 pierwszych zdjęć. Zdjęcia są zapisywane w public/albums/<album>/ (kopie 1600 px),
// dzięki czemu strona nie zależy od tego, czy album w Google nadal jest udostępniony.
// Uruchom: npm run import:google-albums
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const PHOTOS_PER_ALBUM = 10;
const headers = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36', 'accept-language': 'pl-PL,pl;q=0.9' };
const months = { sty: 0, lut: 1, mar: 2, kwi: 3, maj: 4, cze: 5, lip: 6, sie: 7, wrz: 8, paź: 9, lis: 10, gru: 11 };

const decode = (text) => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const slugify = (value) => value.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

// „12–21 paź 2022”, „3 sty 2020”, „paź 2022” → data początku
function parseDate(text) {
  const match = text.match(/(?:(\d{1,2})(?:\s*[–-]\s*\d{1,2})?\s+)?([a-ząćęłńóśźż]{3})\.?(?:\s*[–-]\s*\d{1,2}\s+[a-ząćęłńóśźż]{3}\.?)?\s+(\d{4})/i);
  if (!match || !(match[2].toLowerCase() in months)) return undefined;
  return new Date(Date.UTC(Number(match[3]), months[match[2].toLowerCase()], Number(match[1] ?? 1))).toISOString();
}

const links = [...new Set((await readFile('scripts/google-album-links.txt', 'utf8')).split(/\s+/).filter((line) => line.startsWith('https://')))];
const existing = JSON.parse(await readFile('src/data/albums.json', 'utf8')).map((album) => album.slug);
const albums = [];

for (const link of links) {
  const html = await (await fetch(link, { headers, redirect: 'follow' })).text();
  const ogTitle = decode(html.match(/property="og:title" content="([^"]*)"/)?.[1] ?? '');
  const [rawTitle, ...rest] = ogTitle.split(' · ');
  const title = rawTitle.replace(/[\u{1F000}-\u{1FFFF}☀-➿]/gu, '').trim();
  const cover = html.match(/property="og:image" content="([^"]+)"/)?.[1]?.split('=')[0];
  if (!title || !cover) { console.warn(`Pominięto (nie da się odczytać albumu): ${link}`); continue; }

  // Pozycje albumu w kolejności; filmy mają w metadanych klucz "76647426" (czas trwania) i ikonę odtwarzania na miniaturze.
  const matches = [...html.matchAll(/\["AF1Qip[\w-]+",\["(https:\/\/lh3\.googleusercontent\.com\/pw\/[\w-]+)",\d+,\d+/g)];
  const entries = matches.map((match, index) => ({ url: match[1], video: html.slice(match.index, matches[index + 1]?.index ?? match.index + 4000).includes('"76647426"') }));
  const stills = [...new Map(entries.filter((entry) => !entry.video).map((entry) => [entry.url, entry.url])).values()];
  const coverIsStill = stills.includes(cover);
  const coverUrl = coverIsStill ? cover : stills[0];
  const photos = stills.filter((url) => url !== coverUrl).slice(0, PHOTOS_PER_ALBUM);
  if (!coverUrl) { console.warn(`Pominięto (album bez zdjęć): ${link}`); continue; }

  let slug = slugify(title);
  while (existing.includes(slug) || albums.some((album) => album.slug === slug)) slug = `${slug}-google`;
  await mkdir(`public/albums/${slug}`, { recursive: true });
  const save = async (url, name) => {
    const response = await fetch(`${url}=s1600`, { headers });
    if (!response.ok) throw new Error(`Nie udało się pobrać zdjęcia (${response.status}): ${url}`);
    await sharp(Buffer.from(await response.arrayBuffer())).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(`public/albums/${slug}/${name}.jpg`);
    return `/albums/${slug}/${name}.jpg`;
  };
  const savedCover = await save(coverUrl, 'cover');
  const saved = [];
  for (const [index, url] of photos.entries()) saved.push(await save(url, String(index + 1).padStart(2, '0')));

  albums.push({ slug, title, date: parseDate(rest.join(' · ')) ?? new Date().toISOString(), cover: savedCover, photos: saved, google: link, source: 'google' });
  console.log(`${title}: okładka + ${saved.length} zdjęć`);
}

await writeFile('src/data/google-albums.json', `${JSON.stringify(albums, null, 1)}\n`);
console.log(`Zapisano ${albums.length} albumów z Google Photos.`);
