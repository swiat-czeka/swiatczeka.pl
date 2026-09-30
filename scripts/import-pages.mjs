// Pobiera wybrane podstrony z działającego WordPressa i zapisuje je jako czysty HTML (src/data/legacy-pages.json).
// Uruchom: npm run import:pages
import { writeFile } from 'node:fs/promises';
import sanitizeHtml from 'sanitize-html';

const SITE = 'https://czekaswiat.pl';
const pages = [
  { slug: 'klub', title: 'O nas', cutAfter: /Anka Szostak/ },
  { slug: 'dokad-dalej', title: 'Dokąd dalej?', cutAfter: /@swiatczeka<\/a>/ },
  { slug: 'cookie-policy', title: 'Polityka cookies' },
];

const clean = (html) => sanitizeHtml(html, {
  allowedTags: ['h2', 'h3', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'br', 'img'],
  allowedAttributes: { a: ['href'], img: ['src', 'alt'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  transformTags: { h1: 'h2', h4: 'h3', a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true) },
  exclusiveFilter: (frame) => ['p', 'h2', 'h3', 'li'].includes(frame.tag) && !frame.text.trim(),
});

const out = [];
for (const page of pages) {
  const html = await (await fetch(`${SITE}/${page.slug}/`, { headers: { 'user-agent': 'Mozilla/5.0' } })).text();
  const body = html.match(/<div id="ajax-content-wrap">([\s\S]*?)<div id="footer-outer"/)?.[1] ?? '';
  let cleaned = clean(body.replace(/<(script|style|noscript|form|nav)[\s\S]*?<\/\1>/gi, ''))
    .replace(/<h2>\s*(O nas|Dokąd dalej\?|Cookie Policy)\s*<\/h2>/i, '');
  if (page.cutAfter) {
    const text = cleaned;
    const index = text.search(page.cutAfter);
    if (index > 0) cleaned = text.slice(0, text.indexOf('</p>', index) + 4);
  }
  cleaned = cleaned
    .replace(/<\/a><a href="([^"]+)"( rel="[^"]*")?>/g, (match, href, rel, offset, all) => {
      const previous = all.slice(0, offset).match(/<a href="([^"]+)"[^>]*>[^<]*$/);
      return previous && previous[1] === href ? '' : match;
    })
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ');
  out.push({ slug: page.slug, title: page.title, content: cleaned.trim() });
}
await writeFile('src/data/legacy-pages.json', `${JSON.stringify(out, null, 1)}\n`);
console.log(out.map((page) => `${page.slug}: ${page.content.length} znaków`).join('\n'));
