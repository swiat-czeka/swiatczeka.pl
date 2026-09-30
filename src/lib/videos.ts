import { XMLParser } from 'fast-xml-parser';
import videoData from '@/data/videos.json';
import { YOUTUBE_CHANNEL_ID } from '@/lib/site';

export type Video = { id: string; title: string; description?: string; date?: string; duration?: string };

/** Z opisu filmu z YouTube robi krótki, czytelny skrót: bez linków, hasztagów, znaczników czasu i stopek typu „Subskrybuj”. */
export function summarizeDescription(raw: string | undefined, title = '') {
  if (!raw) return undefined;
  const lines = raw
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/#[\p{L}\p{N}_]+/gu, ' ')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0 && !/^\d{1,2}:\d{2}/.test(line) && !/^(subskrybuj|subscribe|muzyka|music|sprzęt|kamera|kontakt|instagram|facebook|wsparcie|partner)\b/i.test(line));
  const text = lines.join(' ').trim();
  if (text.length < 20 || text.toLocaleLowerCase('pl') === title.toLocaleLowerCase('pl')) return undefined;
  if (text.length <= 190) return text;
  const cut = text.slice(0, 190);
  const boundary = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return `${boundary > 80 ? cut.slice(0, boundary + 1) : `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s-]+$/, '')}…`}`;
}

function formatDuration(iso: string | undefined) {
  const match = iso?.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return undefined;
  const [hours, minutes, seconds] = [match[1], match[2], match[3]].map((value) => Number(value ?? 0));
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

async function fromFeed(channelId: string): Promise<Video[]> {
  try {
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const parsed = new XMLParser({ ignoreAttributes: false }).parse(await response.text());
    const raw = parsed.feed?.entry ?? [];
    return (Array.isArray(raw) ? raw : [raw]).map((entry: { 'yt:videoId': string; title: string; published: string; 'media:group'?: { 'media:description'?: string } }) => {
      const title = String(entry.title);
      return { id: String(entry['yt:videoId']), title, date: entry.published, description: summarizeDescription(entry['media:group']?.['media:description'], title) };
    });
  } catch (error) {
    console.error('Could not read the YouTube feed.', error);
    return [];
  }
}

/** Opisy, daty i długość wszystkich filmów przez oficjalne API YouTube (wymaga YOUTUBE_API_KEY), odświeżane raz na dobę. */
async function fromApi(ids: string[], key: string): Promise<Map<string, Video>> {
  const result = new Map<string, Video>();
  const chunks = Array.from({ length: Math.ceil(ids.length / 50) }, (_, index) => ids.slice(index * 50, index * 50 + 50));
  await Promise.all(chunks.map(async (chunk) => {
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${chunk.join(',')}&key=${key}`, { next: { revalidate: 86400 } });
      if (!response.ok) return;
      const json = await response.json() as { items?: { id: string; snippet: { title: string; description: string; publishedAt: string }; contentDetails: { duration: string } }[] };
      for (const item of json.items ?? []) {
        result.set(item.id, { id: item.id, title: item.snippet.title, description: summarizeDescription(item.snippet.description, item.snippet.title), date: item.snippet.publishedAt, duration: formatDuration(item.contentDetails.duration) });
      }
    } catch (error) {
      console.error('Could not read the YouTube Data API.', error);
    }
  }));
  return result;
}

/** Pełna lista z archiwum + najnowsze filmy z RSS (opis, data) + opcjonalnie wszystkie opisy z API YouTube. */
export async function getVideos(): Promise<Video[]> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID || YOUTUBE_CHANNEL_ID;
  const latest = await fromFeed(channelId);
  const known = new Set(latest.map((video) => video.id));
  const merged = [...latest, ...videoData.videos.filter((video) => !known.has(video.id))] as Video[];
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return merged;
  const details = await fromApi(merged.map((video) => video.id), key);
  const enriched = merged.map((video) => ({ ...video, ...Object.fromEntries(Object.entries(details.get(video.id) ?? {}).filter(([, value]) => value)) }) as Video);
  return enriched.every((video) => video.date) ? enriched.sort((a, b) => Date.parse(b.date!) - Date.parse(a.date!)) : enriched;
}
