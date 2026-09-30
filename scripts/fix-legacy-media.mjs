// Naprawia adresy zdjęć w archiwum: stare ścieżki (swiatczeka.pl/wp-content/uploads/X-622x351.jpg) zamienia na
// istniejące pliki z biblioteki mediów WordPressa (czekaswiat.pl). Uruchom: npm run fix:media
// Opcjonalnie: --media-dir=<katalog z plikami p1.json, p2.json…> (pobranie wcześniej zapisanej biblioteki mediów).
import { readFile, readdir, writeFile } from 'node:fs/promises';

const SITE = 'https://czekaswiat.pl';
const dataPath = 'src/data/legacy-posts.json';
const mediaDir = process.argv.find((arg) => arg.startsWith('--media-dir='))?.split('=')[1];

async function loadMedia() {
  if (mediaDir) {
    const files = (await readdir(mediaDir)).filter((name) => /^p\d+\.json$/.test(name));
    return (await Promise.all(files.map(async (name) => JSON.parse(await readFile(`${mediaDir}/${name}`, 'utf8'))))).flat();
  }
  const items = [];
  for (let page = 1; ; page += 1) {
    const response = await fetch(`${SITE}/wp-json/wp/v2/media?per_page=100&_fields=id,slug,source_url&page=${page}`);
    if (!response.ok) break;
    const batch = await response.json();
    items.push(...batch);
    if (batch.length < 100) break;
  }
  return items;
}

const key = (url) => {
  let name = decodeURIComponent(url.split('?')[0].split('/').pop() ?? '').toLowerCase().replace(/\.[a-z0-9]+$/, '');
  for (let i = 0; i < 4; i += 1) name = name.replace(/-(?:optimized|scaled|rotated|e\d{9,})$/, '').replace(/-\d{2,4}x\d{2,5}$/, '');
  return name;
};
const folder = (url) => url.match(/\/uploads\/(\d{4}\/\d{2})\//)?.[1] ?? '';

const media = await loadMedia();
const exact = new Set(media.map((item) => item.source_url));
const byKey = new Map();
for (const item of media) {
  const k = key(item.source_url);
  if (!byKey.has(k)) byKey.set(k, []);
  byKey.get(k).push(item.source_url);
}

const posts = JSON.parse(await readFile(dataPath, 'utf8'));
const stats = { mapped: 0, alreadyOk: 0, missing: 0 };
const missing = new Set();

function resolve(url, post) {
  const isUpload = /^https?:\/\/[^/]*(?:swiatczeka\.pl|czekaswiat\.pl|e-wsparcie\.atthost\.pl)\/wp-content\/uploads\//i.test(url);
  if (!isUpload) return url;
  const normalized = url.replace(/^https?:\/\/[^/]+/i, SITE);
  if (exact.has(normalized)) { stats.alreadyOk += 1; return normalized; }
  const candidates = byKey.get(key(url));
  if (!candidates) { stats.missing += 1; missing.add(url); return normalized; }
  const month = post.date.slice(0, 7).replace('-', '/');
  stats.mapped += 1;
  return candidates.find((candidate) => folder(candidate) === month) ?? candidates[0];
}

for (const post of posts) {
  post.content = post.content
    .replace(/(<img\b[^>]*?\bsrc=")([^"]+)(")/gi, (_m, a, url, b) => `${a}${resolve(url, post)}${b}`)
    .replace(/(<a\b[^>]*?\bhref=")([^"]+\.(?:jpe?g|png|gif|webp))(")/gi, (_m, a, url, b) => `${a}${resolve(url, post)}${b}`);
  if (post.image) post.image = resolve(post.image, post);
}

await writeFile(dataPath, `${JSON.stringify(posts)}\n`);
console.log(`Biblioteka mediów: ${media.length} plików.`, stats);
if (missing.size) console.log(`Bez pliku w bibliotece (${missing.size}), np.:`, [...missing].slice(0, 5));
