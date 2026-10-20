// Kopiuje zdjęcia użyte w archiwum ze starego serwera (czekaswiat.pl) do katalogu --out=<katalog>, pomniejszone do 1200 px.
// Zapisuje też src/data/media-index.json: { "2015/04/nazwa": "jpg", … } – lista zdjęć, które mają kopię.
// Uruchom: NODE_USE_ENV_PROXY=1 node scripts/mirror-media.mjs --out=/ścieżka/do/katalogu
// Skrypt można przerwać i uruchomić ponownie: istniejące pliki są pomijane.
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import sharp from 'sharp';

const out = process.argv.find((a) => a.startsWith('--out='))?.split('=')[1];
if (!out) throw new Error('Podaj --out=<katalog>');
const SITE = 'https://czekaswiat.pl';
const MAX_WIDTH = 1200;

const key = (url) => {
  let name = decodeURIComponent(url.split('?')[0].split('/').pop() ?? '').toLowerCase().replace(/\.[a-z0-9]+$/, '');
  for (let i = 0; i < 4; i += 1) name = name.replace(/-(?:optimized|scaled|rotated|e\d{9,})$/, '').replace(/-\d{2,4}x\d{2,5}$/, '');
  return name;
};
const pathOf = (url) => url?.match(/wp-content\/uploads\/(\d{4})\/(\d{2})\//)?.slice(1, 3).join('/');
export const mirrorId = (url) => { const p = pathOf(url); return p ? `${p}/${key(url)}` : undefined; };

// 1. Wszystkie zdjęcia użyte w danych strony
const files = ['src/data/legacy-posts.json', 'src/data/legacy-pages.json', 'src/lib/site.ts'];
const used = new Set();
for (const file of files) {
  const text = await readFile(file, 'utf8');
  for (const m of text.matchAll(/https?:\/\/(?:www\.)?(?:czekaswiat|swiatczeka)\.pl\/wp-content\/uploads\/[^"'\s)<>\\]+?\.(?:jpe?g|png|gif|webp)/gi)) { const id = mirrorId(m[0]); if (id) used.add(id); }
}
// Stare albumy (Fotki): okładka i pierwsze zdjęcia, tak samo jak w albumach z Google Photos
const ALBUM_PHOTOS = 11;
const albums = JSON.parse(await readFile('src/data/albums.json', 'utf8'));
for (const album of albums) for (const url of [album.cover, ...album.photos.slice(0, ALBUM_PHOTOS)]) { const id = mirrorId(url); if (id) used.add(id); }
console.log(`Użyte zdjęcia: ${used.size}`);

// 2. Biblioteka mediów WordPressa → adres oryginału dla każdego zdjęcia
const library = new Map();
const total = Number((await fetch(`${SITE}/wp-json/wp/v2/media?per_page=1&_fields=id`)).headers.get('x-wp-totalpages')) / 100;
const pages = Math.ceil(total);
let nextPage = 1;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (true) {
    const page = nextPage++; if (page > pages) return;
    for (let t = 0; t < 4; t += 1) {
      try {
        const r = await fetch(`${SITE}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=source_url`);
        if (!r.ok) throw new Error(r.status);
        for (const m of await r.json()) { const id = mirrorId(m.source_url); if (id && !library.has(id)) library.set(id, m.source_url); }
        break;
      } catch (e) { if (t === 3) console.warn('Nie pobrano strony biblioteki', page); }
    }
  }
}));
console.log(`Biblioteka mediów: ${library.size} zdjęć`);

// 3. Pobranie i zmniejszenie
const index = {};
const missing = [];
const queue = [...used];
let done = 0;
const extOf = (url) => { const e = url.split('?')[0].split('.').pop().toLowerCase(); return e === 'jpeg' ? 'jpg' : e; };
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const id = queue.pop();
    const source = library.get(id);
    if (!source) { missing.push(id); continue; }
    const ext = extOf(source) === 'png' || extOf(source) === 'gif' || extOf(source) === 'webp' ? extOf(source) : 'jpg';
    const target = `${out}/${id}.${ext}`;
    try {
      let ok = await stat(target).then((s) => s.size > 0, () => false);
      if (!ok) {
        let buffer;
        for (let t = 0; t < 4 && !buffer; t += 1) { const r = await fetch(source).catch(() => null); if (r?.ok) buffer = Buffer.from(await r.arrayBuffer()); }
        if (!buffer) { missing.push(id); continue; }
        await mkdir(dirname(target), { recursive: true });
        if (ext === 'gif') await writeFile(target, buffer);
        else {
          const img = sharp(buffer).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
          await (ext === 'png' ? img.png({ compressionLevel: 9, palette: true }) : ext === 'webp' ? img.webp({ quality: 74 }) : img.jpeg({ quality: 72, mozjpeg: true })).toFile(target);
        }
      }
      index[id] = ext;
    } catch (e) { console.warn('Błąd', id, e.message); missing.push(id); }
    if (++done % 250 === 0) console.log(`${done}/${used.size}`);
  }
}));
// albumy wskazują na własne kopie; zdjęcia ponad limit (bez kopii) są pomijane
const local = (url) => { const id = mirrorId(url); return id && index[id] ? `/blog/${id}.${index[id]}` : undefined; };
const albumsOut = albums.map((album) => ({ ...album, cover: local(album.cover) ?? local(album.photos[0]) ?? album.cover, photos: album.photos.slice(0, ALBUM_PHOTOS).map(local).filter(Boolean) })).filter((album) => !album.cover.startsWith('http'));
await writeFile('src/data/albums.json', `${JSON.stringify(albumsOut, null, 1)}\n`);
console.log(`Albumy: ${albumsOut.length} z ${albums.length}`);
await writeFile('src/data/media-index.json', `${JSON.stringify(Object.fromEntries(Object.entries(index).sort()))}\n`);
await writeFile(`${out}/_missing.json`, JSON.stringify(missing, null, 1));
console.log(`Gotowe: ${Object.keys(index).length} zdjęć, brakuje ${missing.length} (lista w ${out}/_missing.json)`);
