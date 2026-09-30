import { XMLParser } from 'fast-xml-parser';
import videoData from '@/data/videos.json';
import { YOUTUBE_CHANNEL_ID } from '@/lib/site';

export type Video = { id: string; title: string; date?: string };

/** Pełna lista z archiwum (scripts/import-videos.mjs) + najnowsze filmy z publicznego RSS kanału, odświeżane co godzinę. */
export async function getVideos(): Promise<Video[]> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID || YOUTUBE_CHANNEL_ID;
  let latest: Video[] = [];
  try {
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, { next: { revalidate: 3600 } });
    if (response.ok) {
      const parsed = new XMLParser({ ignoreAttributes: false }).parse(await response.text());
      const raw = parsed.feed?.entry ?? [];
      latest = (Array.isArray(raw) ? raw : [raw]).map((entry: { 'yt:videoId': string; title: string; published: string }) => ({ id: String(entry['yt:videoId']), title: String(entry.title), date: entry.published }));
    }
  } catch (error) {
    console.error('Could not read the YouTube feed.', error);
  }
  const known = new Set(latest.map((video) => video.id));
  return [...latest, ...videoData.videos.filter((video) => !known.has(video.id))];
}
