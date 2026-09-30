# Świat Czeka

Polski blog podróżniczo-lifestylowy, odtworzony z eksportu WordPressa i ustawień Salient. Frontend i API działają w Next.js na Vercel; publikowanie i zdjęcia są przechowywane w Vercel Blob.

## Lokalnie

```bash
npm install
npm run dev
```

Blog otwiera się pod `http://localhost:3000`. Prywatne studio publikacji jest pod `/studio` i nie ma odnośnika w publicznej nawigacji.

Eksport można przetworzyć ponownie poleceniem `npm run import:wordpress`. Importer czyści uszkodzone znaki sterujące w WXR, zachowuje 846 opublikowanych wpisów, zdjęcia wyróżniające, galerie, kategorie i tagi, a niebezpieczny HTML sanitizuje. Wynik trafia do `src/data/legacy-posts.json` i jest częścią wdrożenia.

## Wdrożenie Vercel

1. Zaimportuj repozytorium `swiat-czeka/swiatczeka.pl` do Vercel (Next.js, ustawienia domyślne).
2. W Storage dodaj **Blob** (daje `BLOB_READ_WRITE_TOKEN`) oraz opcjonalnie **Upstash Redis** (statystyki odwiedzin w panelu).
3. W Settings → Environment Variables dodaj `ANTHROPIC_API_KEY`. Opcjonalnie `YOUTUBE_CHANNEL_ID` i `CRON_SECRET` (wpisy z YouTube), `SESSION_SECRET`.
4. Zrób redeploy, a domenę `swiatczeka.pl` podepnij na samym końcu.

## Panel administratora

Dyskretny link (gwiazdka ✳ na dole strony głównej) prowadzi do `/studio`. Logowanie: jedno konto `anka@swiatczeka.pl` (hasło jest w repozytorium tylko jako hash scrypt, zob. `src/lib/auth.ts`). Panel pokazuje statystyki, drafty do dokończenia i pozwala dyktować wpisy ze zdjęciami. AI tylko wygładza tekst (interpunkcja, podział na zdania, powtórzenia), dodaje nagłówki `##`, adres URL i opis SEO oraz krótką wersję na Instagram.

Wpisy z archiwum WordPressa bez tekstu i bez zdjęć (np. sam link do albumu Picasa) są automatycznie draftami i nie pojawiają się na blogu, dopóki ich nie dokończysz.

## Mapa

`/mapa` i sekcja na stronie głównej: szara mapa świata, kraje z wpisami zapalają się na zielono i prowadzą do wpisów z danego kraju. Mapowanie kraj → kategoria jest w `src/lib/countries.ts`.

Zdjęcia i pliki medialne z archiwum pozostały pod adresami `czekaswiat.pl`, ponieważ eksport WXR nie zawiera samych plików. Oryginalny hosting mediów musi pozostać dostępny, dopóki te zasoby nie zostaną skopiowane do nowego magazynu.