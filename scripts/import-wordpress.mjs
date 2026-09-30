import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';
import sanitizeHtml from 'sanitize-html';

const inputPath = 'wiatczeka.WordPress.2026-09-30.xml';
const outputPath = 'src/data/legacy-posts.json';
const wp = 'wp:';
const excerpt = 'excerpt:';
const content = 'content:';

const source = (await readFile(inputPath, 'utf8')).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
  cdataPropName: '__cdata',
  processEntities: true,
  isArray: (_tag, jPath) => jPath === 'rss.channel.item' || jPath.endsWith('.category') || jPath.endsWith('.wp:postmeta'),
});

const root = parser.parse(source).rss.channel;
const items = root.item ?? [];
const read = (value) => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return value.__cdata ?? value['#text'] ?? '';
  return '';
};
const meta = (item) => Object.fromEntries((item[`${wp}postmeta`] ?? []).map((entry) => [
  read(entry[`${wp}meta_key`]), read(entry[`${wp}meta_value`]),
]));
const attachments = new Map();

for (const item of items) {
  if (read(item[`${wp}post_type`]) !== 'attachment') continue;
  const id = read(item[`${wp}post_id`]);
  const values = meta(item);
  attachments.set(id, {
    url: read(item[`${wp}attachment_url`]).replaceAll('&amp;', '&'),
    alt: values._wp_attachment_image_alt ?? read(item.title),
  });
}

const clean = (value) => sanitizeHtml(value, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption', 'iframe', 'video', 'source']),
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title'],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading', 'class'],
    iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'loading'],
    video: ['src', 'controls', 'poster', 'width', 'height'],
    source: ['src', 'type'],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }, true),
  },
});

function renderContent(raw) {
  let html = raw ?? '';
  html = html.replace(/\[gallery\b([^\]]*)\]/gi, (_match, attributes) => {
    const ids = attributes.match(/ids=["']([^"']+)["']/i)?.[1]?.split(',') ?? [];
    return `<div class="legacy-gallery">${ids.map((id) => {
      const image = attachments.get(id.trim());
      return image?.url ? `<figure><img src="${image.url}" alt="${image.alt}" loading="lazy"></figure>` : '';
    }).join('')}</div>`;
  });
  html = html.replace(/\[\/??[a-zA-Z_][\w:-]*(?:\s[^\]]*)?\]/g, '');
  return clean(html);
}

const posts = items
  .filter((item) => read(item[`${wp}post_type`]) === 'post' && read(item[`${wp}status`]) === 'publish')
  .map((item) => {
    const values = meta(item);
    const thumbnail = attachments.get(values._thumbnail_id);
    const terms = Array.isArray(item.category) ? item.category : [item.category].filter(Boolean);
    const categories = terms.filter((term) => term['@_domain'] === 'category')
      .map((term) => ({ name: read(term), slug: term['@_nicename'] ?? '' }));
    const tags = terms.filter((term) => term['@_domain'] === 'post_tag')
      .map((term) => ({ name: read(term), slug: term['@_nicename'] ?? '' }));
    const body = renderContent(read(item[`${content}encoded`]));
    const plain = sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim();
    const summary = sanitizeHtml(read(item[`${excerpt}encoded`]), { allowedTags: [], allowedAttributes: {} }).trim();

    return {
      id: read(item[`${wp}post_id`]),
      slug: read(item[`${wp}post_name`]) || read(item[`${wp}post_id`]),
      title: read(item.title).trim(),
      date: read(item[`${wp}post_date_gmt`]) || read(item[`${wp}post_date`]),
      modified: read(item[`${wp}post_modified_gmt`]) || read(item[`${wp}post_modified`]),
      author: read(item['dc:creator']) || 'Świat Czeka',
      excerpt: summary || plain.slice(0, 220),
      content: body,
      image: thumbnail?.url ?? '',
      imageAlt: thumbnail?.alt ?? read(item.title),
      categories,
      tags,
    };
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

await mkdir('src/data', { recursive: true });
await writeFile(outputPath, `${JSON.stringify(posts)}\n`);
console.log(`Imported ${posts.length} published posts and ${attachments.size} media records to ${outputPath}.`);