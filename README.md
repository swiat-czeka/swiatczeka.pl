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

1. Zaimportuj repozytorium `swiat-czeka/swiatczeka.pl` do Vercel i ustaw domenę `swiatczeka.pl`.
2. W projekcie Vercel dodaj magazyn Blob. Vercel udostępni aplikacji `BLOB_READ_WRITE_TOKEN`.
3. W ustawieniach projektu dodaj sekrety `ADMIN_PASSWORD`, `SESSION_SECRET` i `OPENAI_API_KEY` dla środowisk Preview i Production. Hasło administratora powinno być długie, a `SESSION_SECRET` losowy i mieć co najmniej 32 znaki; można go wygenerować przez `openssl rand -base64 48`.
4. Ponownie wdroż projekt po zapisaniu zmiennych.
5. Otwórz `/studio`, zaloguj się jedynym skonfigurowanym hasłem, nagraj lub wpisz opowieść, dodaj maksymalnie 6 zdjęć i wygeneruj szkic. Można go poprawić przed publikacją.

Adres `/studio` jest celowo pominięty w nawigacji i blokowany dla robotów indeksujących, ale o dostępie decyduje podpisana sesja i hasło, nie sama nieznajomość adresu. Używaj unikalnego hasła i nie umieszczaj sekretów w repozytorium. Bez `OPENAI_API_KEY` szkicu AI nie da się generować; bez magazynu Blob nie da się przesyłać zdjęć ani publikować wpisów. Dyktowanie wykorzystuje Web Speech API przeglądarki; gdy nie jest dostępne, transkrypcję można wpisać ręcznie.

Zdjęcia i pliki medialne z archiwum pozostały pod adresami `czekaswiat.pl`, ponieważ eksport WXR nie zawiera samych plików. Oryginalny hosting mediów musi pozostać dostępny, dopóki te zasoby nie zostaną skopiowane do nowego magazynu.