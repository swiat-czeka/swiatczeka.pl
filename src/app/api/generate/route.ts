import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Brak dostępu.' }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Dodaj klucz OpenAI w ustawieniach Vercel.' }, { status: 503 });
  const { transcript, images = [], type = 'post' } = await request.json().catch(() => ({}));
  if (typeof transcript !== 'string' || transcript.trim().length < 8) {
    return NextResponse.json({ error: 'Powiedz lub wpisz kilka zdań o swojej historii.' }, { status: 400 });
  }

  const imageBlocks = Array.isArray(images)
    ? images.filter((url: unknown): url is string => typeof url === 'string' && url.startsWith('https://')).slice(0, 6).map((url: string) => ({ type: 'image_url' as const, image_url: { url, detail: 'low' as const } }))
    : [];
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const instructions = type === 'page'
    ? 'Jesteś redaktorem i copywriterem polskiej marki podróżniczo-lifestylowej Świat Czeka. Z notatek przygotuj krótką, przejrzystą landing page po polsku: jasny tytuł, zapraszający wstęp, 2-4 sekcje z nagłówkami i naturalne zakończenie. Nie wymyślaj ofert, faktów, nazw ani cytatów. Zdjęcia potraktuj jako kontekst. Zwróć wyłącznie JSON z polami title, excerpt, content (zwykły tekst; nagłówki oznaczaj ##, sekcje oddzielaj pustą linią, bez HTML), categories (1-3 krótkie kategorie).'
    : 'Jesteś redaktorem polskiego bloga podróżniczo-lifestylowego Świat Czeka. Z chaotycznej transkrypcji przygotuj wierny, ciepły, osobisty szkic po polsku. Nie wymyślaj faktów, nazw, cytatów ani szczegółów widocznych na zdjęciach. Zdjęcia potraktuj jako kontekst i wskaż w treści tylko to, co widać. Zachowaj głos autorki. Zwróć wyłącznie JSON z polami title, excerpt, content (zwykły tekst; akapity oddzielone pustą linią, bez HTML), categories (1-3 krótkie kategorie).';
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    max_tokens: 1800,
    messages: [
      {
        role: 'system',
        content: instructions,
      },
      {
        role: 'user',
        content: [{ type: 'text', text: `Moja opowieść do opracowania:\n${transcript.trim()}` }, ...imageBlocks],
      },
    ],
  });
  const draft = response.choices[0]?.message.content;
  if (!draft) return NextResponse.json({ error: 'Nie udało się przygotować szkicu.' }, { status: 502 });
  return NextResponse.json(JSON.parse(draft));
}