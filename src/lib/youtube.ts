import { XMLParser } from 'fast-xml-parser';
import { getAllPosts } from '@/lib/posts';
import { savePost } from '@/lib/publish';
import { RESERVED_SLUGS, slugify } from '@/lib/legacy';
import { YOUTUBE_CHANNEL_ID } from '@/lib/site';
import type { BlogPost } from '@/lib/types';

type Entry = { 'yt:videoId': string; title: string; published: string; 'media:group'?: { 'media:description'?: string; 'media:thumbnail'?: { '@_url': string } } };

/** Pobiera publiczny kanał RSS YouTube (bez klucza API) i dodaje nowe filmy jako wpisy w kategorii „Filmy”. */
export async function syncYoutube() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID || YOUTUBE_CHANNEL_ID;
  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`, { cache: 'no-store' });
  if (!response.ok) return { ok: false as const, error: `YouTube zwrócił błąd ${response.status}.` };
  const parsed = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' }).parse(await response.text());
  const raw = parsed.feed?.entry ?? [];
  const entries: Entry[] = Array.isArray(raw) ? raw : [raw];

  const posts = await getAllPosts();
  const known = new Set(posts.map((post) => post.youtubeId).filter(Boolean));
  const slugs = new Set([...posts.map((post) => post.slug), ...RESERVED_SLUGS]);
  const added: string[] = [];
  for (const entry of entries) {
    const id = String(entry['yt:videoId']);
    if (known.has(id)) continue;
    const title = String(entry.title).trim();
    let slug = slugify(title) || `film-${id.toLowerCase()}`;
    for (let n = 2; slugs.has(slug); n += 1) slug = `${slugify(title).slice(0, 74)}-${n}`;
    slugs.add(slug);
    const description = String(entry['media:group']?.['media:description'] ?? '').trim();
    const post: BlogPost = {
      id: `new-yt-${id}`,
      slug,
      title,
      excerpt: description.split(/\n\s*\n/)[0]?.slice(0, 300) ?? '',
      content: description || title,
      format: 'text',
      status: 'published',
      image: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      imageAlt: title,
      gallery: [],
      categories: [{ name: 'Filmy', slug: 'filmy' }],
      tags: [],
      date: new Date(entry.published).toISOString(),
      modified: new Date().toISOString(),
      author: 'Anka',
      youtubeId: id,
    };
    await savePost(post, 'posts');
    added.push(slug);
  }
  return { ok: true as const, added };
}
