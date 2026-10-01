// Pobiera pełną listę filmów z kanału YouTube (playlista „uploads”) do src/data/videos.json.
// Nowe filmy (15 ostatnich) strona dociąga sama z kanału RSS, więc ten skrypt wystarczy uruchomić raz na jakiś czas.
// Uruchom: npm run import:videos
import { writeFile } from 'node:fs/promises';

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCWqJfykBDuGrvT5lbBErGWg';
const playlistId = `UU${CHANNEL_ID.slice(2)}`;
const headers = { 'user-agent': 'Mozilla/5.0', 'accept-language': 'pl-PL,pl;q=0.9', cookie: 'CONSENT=YES+1; SOCS=CAI' };

// „1,2 tys. wyświetleń”, „3,4 mln wyświetleń”, „523 wyświetlenia” → liczba (przybliżona)
function parseViews(lockup) {
  const text = JSON.stringify(lockup.metadata ?? {}).match(/"(?:content|accessibilityLabel)":"(\d[^"]*wyświetl[^"]*)"/)?.[1] ?? '';
  const match = text.replace(/\\u00a0|\u00a0/g, ' ').match(/^(\d[\d\s]*(?:[,.]\d+)?)\s*(tys\.|mln)?/);
  if (!match) return undefined;
  const value = Number(match[1].replace(/\s/g, '').replace(',', '.'));
  return Math.round(value * (match[2] === 'mln' ? 1e6 : match[2] ? 1e3 : 1));
}

const videos = [];
const seen = new Set();
const collect = (node) => {
  if (Array.isArray(node)) return node.forEach(collect);
  if (!node || typeof node !== 'object') return;
  const lockup = node.lockupViewModel;
  if (lockup?.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO' && lockup.contentId && !seen.has(lockup.contentId)) {
    seen.add(lockup.contentId);
    videos.push({ id: lockup.contentId, title: lockup.metadata?.lockupMetadataViewModel?.title?.content ?? lockup.contentId, views: parseViews(lockup) });
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

// Zwiastun kanału (film dla osób, które jeszcze nie subskrybują) z publicznej strony kanału.
let trailerId;
try {
  const channelPage = await (await fetch(`https://www.youtube.com/channel/${CHANNEL_ID}?hl=pl`, { headers })).text();
  const data = channelPage.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/)?.[1];
  trailerId = data ? JSON.stringify(JSON.parse(data)).match(/"channelVideoPlayerRenderer":\{"videoId":"([\w-]{11})"/)?.[1] : undefined;
} catch { /* zwiastun jest opcjonalny */ }

await writeFile('src/data/videos.json', `${JSON.stringify({ channelId: CHANNEL_ID, trailerId, videos })}\n`);
console.log(`Zapisano ${videos.length} filmów z kanału ${CHANNEL_ID}.`);
