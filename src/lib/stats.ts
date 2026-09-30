// Licznik odwiedzin na Upstash Redis (Vercel → Storage → Upstash Redis). Bez konfiguracji panel pokazuje podpowiedź.
type Command = (string | number)[];

function config() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

export const statsConfigured = () => Boolean(config());

async function pipeline(commands: Command[]): Promise<unknown[]> {
  const cfg = config();
  if (!cfg) return [];
  const response = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Redis ${response.status}`);
  const results = await response.json() as { result?: unknown }[];
  return results.map((entry) => entry.result);
}

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

export async function recordView(path: string) {
  if (!config()) return;
  const day = dayKey(new Date());
  await pipeline([
    ['INCR', 'pv:total'],
    ['INCR', `pv:d:${day}`],
    ['EXPIRE', `pv:d:${day}`, 60 * 60 * 24 * 400],
    ['HINCRBY', `pv:p:${day}`, path, 1],
    ['EXPIRE', `pv:p:${day}`, 60 * 60 * 24 * 60],
  ]);
}

export async function getStats(days = 30) {
  if (!config()) return null;
  const dates = Array.from({ length: days }, (_, index) => dayKey(new Date(Date.now() - (days - 1 - index) * 86400000)));
  const results = await pipeline([
    ['GET', 'pv:total'],
    ...dates.map((date): Command => ['GET', `pv:d:${date}`]),
    ...dates.map((date): Command => ['HGETALL', `pv:p:${date}`]),
  ]);
  const perDay = dates.map((date, index) => ({ date, count: Number(results[1 + index] ?? 0) }));
  const top = new Map<string, number>();
  for (const hash of results.slice(1 + days)) {
    const flat = Array.isArray(hash) ? hash as string[] : [];
    for (let i = 0; i < flat.length; i += 2) top.set(flat[i], (top.get(flat[i]) ?? 0) + Number(flat[i + 1]));
  }
  return {
    total: Number(results[0] ?? 0),
    last7: perDay.slice(-7).reduce((sum, day) => sum + day.count, 0),
    last30: perDay.reduce((sum, day) => sum + day.count, 0),
    perDay,
    top: [...top].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, count]) => ({ path, count })),
  };
}
