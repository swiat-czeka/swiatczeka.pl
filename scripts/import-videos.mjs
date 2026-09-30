// Pobiera pełną listę filmów z kanału YouTube (playlista „uploads”) do src/data/videos.json.
// Nowe filmy (15 ostatnich) strona dociąga sama z kanału RSS, więc ten skrypt wystarczy uruchomić raz na jakiś czas.
// Uruchom: npm run import:videos
import { writeFile } from 'node:fs/promises';

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCWqJfykBDuGrvT5lbBErGWg';
const playlistId = `UU${CHANNEL_ID.slice(2)}`;
const headers = { 'user-agent': 'Mozilla/5.0', 'accept-language': 'pl-PL,pl;q=0.9', cookie: 'CONSENT=YES+1; SOCS=CAI' };

const videos = [];
const seen = new Set();
const collect = (node) => {
  if (Array.isArray(node)) return node.forEach(collect);
  if (!node || typeof node !== 'object') return;
  const lockup = node.lockupViewModel;
  if (lockup?.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO' && lockup.contentId && !seen.has(lockup.contentId)) {
    seen.add(lockup.contentId);
    videos.push({ id: lockup.contentId, title: lockup.metadata?.lockupMetadataViewModel?.title?.content ?? lockup.contentId });
  }
  if (node.continuationCommand?.token) continuation = String(node.continuationCommand.token);
  Object.values(node).forEach(collect);
};

let continuation;
const page = await (await fetch(`https://www.youtube.com/playlist?list=${playlistId}&hl=pl`, { headers })).text();
const initial = page.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/)?.[1];
if (!initial) throw new Error('Nie znaleziono danych playlisty (YouTube zmienił stronę?).');
collect(JSON.parse(initial));

for (let round = 0; continuation && round < 60; round += 1) {
  const token = continuation;
  continuation = undefined;
  const response = await fetch('https://www.youtube.com/youtubei/v1/browse?prettyPrint=false', {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: '2.20250101.00.00', hl: 'pl', gl: 'PL' } }, continuation: token }),
  });
  if (!response.ok) break;
  collect(await response.json());
}

await writeFile('src/data/videos.json', `${JSON.stringify({ channelId: CHANNEL_ID, videos })}\n`);
console.log(`Zapisano ${videos.length} filmów z kanału ${CHANNEL_ID}.`);
