import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { slugify } from '@/lib/legacy';
import { getCategoryCounts } from '@/lib/posts';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    slug: { type: 'string' },
    excerpt: { type: 'string' },
    seoDescription: { type: 'string' },
    content: { type: 'string' },
    categories: { type: 'array', items: { type: 'string' } },
    instagram: { type: 'string' },
  },
  required: ['title', 'slug', 'excerpt', 'seoDescription', 'content', 'categories', 'instagram'],
  additionalProperties: false,
} as const;

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

Zwróć pola: title, slug, excerpt, seoDescription, content, categories, instagram. W content akapity oddzielaj pustą linią, bez HTML.`;

const PAGE_RULES = 'Jesteś redaktorem polskiej marki podróżniczej Świat Czeka. Z notatek przygotuj krótką, przejrzystą stronę: tytuł, zapraszający wstęp, 2–4 sekcje z nagłówkami „## ”. Nie wymyślaj ofert, faktów, nazw ani cytatów. Pole content: akapity oddzielone pustą linią, bez HTML; categories: 1–3; instagram: pusty string.';

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Brak dostępu.' }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Dodaj klucz Claude (ANTHROPIC_API_KEY) w ustawieniach Vercel.' }, { status: 503 });
  const { transcript, images = [], type = 'post' } = await request.json().catch(() => ({}));
  if (typeof transcript !== 'string' || transcript.trim().length < 8) {
    return NextResponse.json({ error: 'Powiedz lub wpisz kilka zdań o swojej historii.' }, { status: 400 });
  }

  const imageBlocks: Anthropic.ImageBlockParam[] = Array.isArray(images)
    ? images.filter((url: unknown): url is string => typeof url === 'string' && url.startsWith('https://')).slice(0, 6).map((url: string) => ({ type: 'image', source: { type: 'url', url } }))
    : [];
  const known = [...(await getCategoryCounts()).values()].sort((a, b) => b.count - a.count).slice(0, 60).map((category) => category.name).join(', ');
  const client = new Anthropic();

  try {
    const message = await client.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      system: type === 'page' ? PAGE_RULES : POST_RULES,
      output_config: { format: { type: 'json_schema', schema: RESULT_SCHEMA } },
      messages: [{
        role: 'user',
        content: [
          ...imageBlocks,
          { type: 'text', text: `Istniejące kategorie: ${known}\n\nTranskrypcja do lekkiej redakcji:\n${transcript.trim().slice(0, 24000)}` },
        ],
      }],
    }).finalMessage();

    if (message.stop_reason === 'refusal') return NextResponse.json({ error: 'Claude odmówił przetworzenia tego tekstu. Spróbuj przeformułować lub wpisz wpis ręcznie.' }, { status: 422 });
    if (message.stop_reason === 'max_tokens') return NextResponse.json({ error: 'Tekst jest za długi na jedno podejście. Podziel go na dwa wpisy.' }, { status: 422 });
    const text = message.content.find((block): block is Anthropic.TextBlock => block.type === 'text')?.text;
    if (!text) return NextResponse.json({ error: 'Nie udało się przygotować szkicu.' }, { status: 502 });
    const draft = JSON.parse(text);
    return NextResponse.json({ ...draft, slug: slugify(String(draft.slug || draft.title || '')) });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return NextResponse.json({ error: 'Klucz ANTHROPIC_API_KEY jest nieprawidłowy.' }, { status: 503 });
    if (error instanceof Anthropic.RateLimitError) return NextResponse.json({ error: 'Claude jest chwilowo przeciążony. Spróbuj za minutę.' }, { status: 429 });
    console.error('Claude draft generation failed.', error);
    return NextResponse.json({ error: 'Nie udało się przygotować szkicu. Spróbuj jeszcze raz.' }, { status: 502 });
  }
}
