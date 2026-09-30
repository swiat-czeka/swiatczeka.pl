import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { slugify } from '@/lib/legacy';
import { getCategoryCounts } from '@/lib/posts';

export const runtime = 'nodejs';
export const maxDuration = 60;

const POST_RULES = `Jesteś redaktorem-korektorem polskiego bloga podróżniczego „Świat Czeka”. Dostajesz surową transkrypcję głosową autorki (Anki). Twoje zadanie to WYŁĄCZNIE lekka redakcja, nie pisanie od nowa.

ZASADY WIERNOŚCI (najważniejsze):
- Zachowaj słowa, styl, ton, humor, potoczność i kolejność wypowiedzi autorki. Pisz w tej samej osobie i czasie co ona.
- Wolno Ci: podzielić tekst na zdania i akapity, dodać interpunkcję i wielkie litery, poprawić ewidentne przejęzyczenia i błędy rozpoznawania mowy, usunąć wtrącenia typu „yyy”, „no więc”, „jakby” oraz dosłowne powtórzenia.
- Nie wolno Ci: dodawać faktów, nazw, opinii, przymiotników ani cytatów, których autorka nie powiedziała; upiększać; zmieniać znaczenia; „ulepszać” stylu; streszczać. Jeśli czegoś nie wiesz, tego nie wpisuj.
- Zdjęcia to tylko kontekst pomocniczy; nie opisuj ich w treści.

STRUKTURA I SEO:
- Jeśli tekst ma więcej niż ok. 150 słów, wstaw nagłówki sekcji w formie „## Nagłówek” (co 3–5 akapitów). Nagłówek ma być krótki, opisowy i zawierać nazwę miejsca lub temat z tekstu. Nie używaj nagłówka H1.
- title: naturalny tytuł wpisu (max 70 znaków), z nazwą miejsca lub wydarzenia, wyraźnie oparty na tym, co powiedziała autorka.
- slug: krótki adres URL po polsku, bez polskich znaków, małe litery, myślniki, 3–6 słów, np. „sylwester-na-filipinach”.
- seoDescription: 130–155 znaków, opis wpisu zachęcający do kliknięcia, bez wymyślonych faktów.
- excerpt: 1–2 zdania wstępu z tekstu autorki.
- categories: 1–3 kategorie w mianowniku (kraj/miejsce/temat). Jeśli pasuje któraś z istniejących kategorii, użyj jej dokładnej nazwy.
- instagram: krótka wersja na Instagram (max 600 znaków) w głosie autorki, z 1–2 emoji i 5–8 hasztagami na końcu.

Zwróć wyłącznie JSON z polami: title, slug, excerpt, seoDescription, content, categories, instagram. W content akapity oddzielaj pustą linią, bez HTML.`;

const PAGE_RULES = 'Jesteś redaktorem polskiej marki podróżniczej Świat Czeka. Z notatek przygotuj krótką, przejrzystą stronę: tytuł, zapraszający wstęp, 2–4 sekcje z nagłówkami „## ”. Nie wymyślaj ofert, faktów, nazw ani cytatów. Zwróć wyłącznie JSON z polami title, slug, excerpt, seoDescription, content (akapity oddzielone pustą linią, bez HTML), categories (1–3), instagram (pusty string).';

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Brak dostępu.' }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Dodaj klucz OpenAI (OPENAI_API_KEY) w ustawieniach Vercel.' }, { status: 503 });
  const { transcript, images = [], type = 'post' } = await request.json().catch(() => ({}));
  if (typeof transcript !== 'string' || transcript.trim().length < 8) {
    return NextResponse.json({ error: 'Powiedz lub wpisz kilka zdań o swojej historii.' }, { status: 400 });
  }

  const imageBlocks = Array.isArray(images)
    ? images.filter((url: unknown): url is string => typeof url === 'string' && url.startsWith('https://')).slice(0, 6).map((url: string) => ({ type: 'image_url' as const, image_url: { url, detail: 'low' as const } }))
    : [];
  const known = [...(await getCategoryCounts()).values()].sort((a, b) => b.count - a.count).slice(0, 60).map((category) => category.name).join(', ');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 4000,
    messages: [
      { role: 'system', content: type === 'page' ? PAGE_RULES : POST_RULES },
      { role: 'user', content: [{ type: 'text', text: `Istniejące kategorie: ${known}\n\nTranskrypcja do lekkiej redakcji:\n${transcript.trim().slice(0, 24000)}` }, ...imageBlocks] },
    ],
  });
  const raw = response.choices[0]?.message.content;
  if (!raw) return NextResponse.json({ error: 'Nie udało się przygotować szkicu.' }, { status: 502 });
  try {
    const draft = JSON.parse(raw);
    return NextResponse.json({ ...draft, slug: slugify(String(draft.slug || draft.title || '')) });
  } catch {
    return NextResponse.json({ error: 'Odpowiedź AI była nieczytelna. Spróbuj jeszcze raz.' }, { status: 502 });
  }
}
