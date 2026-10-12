// „Małe sukcesy” na stronie O nas: dane z tabelki podanej przez autorkę.
export type Achievement = { title: string; summary: string; items: { name: string; when: string; km?: number; note?: string; href?: string; hrefLabel?: string }[] };

export const achievements: Achievement[] = [
  {
    title: 'Szlaki piesze',
    summary: '1254 km',
    items: [
      { name: 'Szlak Orlich Gniazd', when: '10–16 sierpnia 2017', km: 163, note: 'Kilka dni przyjemnego spacerku po jurajskich zamkach.', href: 'https://photos.app.goo.gl/QwfQAuZ4QdC5dK9i6' },
      { name: 'Te Araroa, Nowa Zelandia', when: 'grudzień 2017', km: 333, note: 'Małe, wyczerpujące fragmenty: to zaledwie 10% szlaku, ale i tak było ostro. O tym będzie w książce.' },
      { name: 'Główny Szlak Beskidzki', when: '2018–2019', km: 504, note: 'Plan był taki, żeby przejść go jednym ciągiem, ale po drugim dniu w Bieszczadach „skasowałam sobie kolana” i zmieniliśmy plan. Raz w miesiącu robiliśmy kolejne etapy. Tak też się da.', href: 'https://photos.app.goo.gl/bHVAnTxn9DP1qX9g8' },
      { name: 'Szlak Świętokrzyski', when: '21–24 maja 2020', km: 254, note: '254 km przygody.', href: 'https://photos.app.goo.gl/fqFXMP3jJAhwhJoZ9' },
    ],
  },
  {
    title: 'Szlaki rowerowe',
    summary: '4024 km',
    items: [
      { name: 'EuroVelo 10 nad Bałtykiem', when: '6–14 sierpnia 2021', km: 430, note: 'Tłum w nadmorskich kurortach, a my między goframi i dmuchańcami przepychamy się rowerami ze Świnoujścia do Piasków.', href: 'https://photos.app.goo.gl/3ooByTJtAGtgsFdd9' },
      { name: 'Velo Dunajec', when: '6–9 sierpnia 2022', km: 318, note: 'Z Katowic pociągiem do Tarnowa, potem dwa dni malowniczą trasą, która ciągle nam się gubiła (temat do powtórki). Z Zakopanego pociągiem do Bielska i stamtąd przypedałowaliśmy do Katowic wprost na moje urodziny.', href: 'https://photos.app.goo.gl/6vzoiNLeNT4i6YJX8' },
      { name: 'Wielka Pętla Mazurska', when: '20–25 maja 2023', km: 292, note: 'Otwarcie sezonu i szybka jazda po niedokończonej trasie mazurskiej. Warto było, chociaż zachodni brzeg jezior dał nam nieźle popalić, bo nie było noclegu w komfortowym dla nas zasięgu.', href: 'https://photos.app.goo.gl/n61NHdbb9PzQekB2A' },
      { name: 'Dolina Baryczy', when: '23–25 czerwca 2024', km: 170 },
      { name: 'Katowice – Kaszuby', when: '23–30 kwietnia 2025', km: 550 },
      { name: 'Green Velo', when: '22 lipca – 13 sierpnia 2025', km: 1555, note: 'Od Końskich do Malborka, nieśpiesznie, w 23 dni.', href: 'https://photos.app.goo.gl/2ECNtbUfjoh7pHK88' },
      { name: 'Trasa Nysa – Odra', when: '2–10 sierpnia 2026', km: 709 },
    ],
  },
  {
    title: 'Sisters by Bike',
    summary: '2258 km z Judką',
    items: [
      { name: 'Lublin – Horodło', when: '16–18 sierpnia 2018', km: 147, href: 'https://www.komoot.com/pl-pl/collection/1637766/-sisters-by-bike-2018', hrefLabel: 'Trasa na Komoot' },
      { name: 'Katowice – Lublin', when: '2–10 czerwca 2019', km: 370, href: 'https://www.komoot.com/pl-pl/collection/1637747/-sisters-by-bike-2019', hrefLabel: 'Trasa na Komoot' },
      { name: 'Zgorzelec – Katowice', when: '30 czerwca – 5 lipca 2020', km: 440, href: 'https://www.komoot.com/pl-pl/collection/1637764/-sisters-by-bike-2020', hrefLabel: 'Trasa na Komoot' },
      { name: 'Bochum – Detmold', when: '27–28 maja 2022', km: 167, href: 'https://www.komoot.com/pl-pl/tour/785162914', hrefLabel: 'Trasa na Komoot' },
      { name: 'Zgorzelec – Detmold', when: '26 maja – 6 czerwca 2024', km: 740, href: 'https://www.komoot.com/pl-pl/collection/2803540/-sisters-by-bike-2022%2B2024', hrefLabel: 'Trasa na Komoot' },
      { name: 'Ren i Mozela', when: '7–12 września 2026', km: 394, href: 'https://www.komoot.com/pl-pl/collection/4633763/-sbb-2026-rhein-mosel', hrefLabel: 'Trasa na Komoot' },
    ],
  },
];

export const wonders: Achievement[] = [
  {
    title: '7 cudów nowożytnego świata',
    summary: 'zaliczone wszystkie 7 z 7',
    items: [
      { name: 'Mur Chiński, Chiny', when: 'październik 2005' },
      { name: 'Tadź Mahal, Agra, Indie', when: 'listopad 2006' },
      { name: 'Koloseum, Rzym, Włochy', when: 'wrzesień 2007' },
      { name: 'Statua Chrystusa Zbawiciela, Rio de Janeiro, Brazylia', when: 'listopad 2018' },
      { name: 'Machu Picchu, Aguas Calientes, Peru', when: 'styczeń 2019' },
      { name: 'Petra, Jordania', when: 'listopad 2019' },
      { name: 'Chichén Itzá, Valladolid, Meksyk', when: 'listopad 2021' },
    ],
  },
  {
    title: '7 cudów natury',
    summary: '5 z 7, dwa jeszcze przed nami',
    items: [
      { name: 'Podziemna rzeka w Puerto Princesa, Filipiny', when: 'listopad 2008' },
      { name: 'Zatoka Ha Long, Wietnam', when: 'luty 2011' },
      { name: 'Wodospady Iguazú, Brazylia i Argentyna', when: 'listopad 2018' },
      { name: 'Amazonia, Brazylia, Peru i Kolumbia', when: 'grudzień 2018' },
      { name: 'Wyspa Komodo, Indonezja', when: 'listopad 2025' },
      { name: 'Góra Stołowa, Republika Południowej Afryki', when: 'jeszcze przed nami' },
      { name: 'Wyspa Jeju, Korea Południowa', when: 'jeszcze przed nami' },
    ],
  },
];
