/** Nazwa kraju w `world-atlas` → slug kategorii na blogu. */
export const countryCategories: Record<string, { slug: string; continent: string; label: string }> = {
  Thailand: { slug: 'tajlandia', continent: 'azja', label: 'Tajlandia' },
  Philippines: { slug: 'filipiny', continent: 'azja', label: 'Filipiny' },
  Malaysia: { slug: 'malezja', continent: 'azja', label: 'Malezja' },
  Laos: { slug: 'laos', continent: 'azja', label: 'Laos' },
  Myanmar: { slug: 'birma', continent: 'azja', label: 'Birma' },
  Chile: { slug: 'chile', continent: 'ameryka-poludniowa', label: 'Chile' },
  Morocco: { slug: 'maroko', continent: 'afryka', label: 'Maroko' },
  Argentina: { slug: 'argentyna', continent: 'ameryka-poludniowa', label: 'Argentyna' },
  Indonesia: { slug: 'bali', continent: 'azja', label: 'Indonezja (Bali)' },
  Vietnam: { slug: 'wietnam', continent: 'azja', label: 'Wietnam' },
  'United States of America': { slug: 'usa', continent: 'ameryka-polnocna', label: 'USA' },
  Cambodia: { slug: 'kambodza', continent: 'azja', label: 'Kambodża' },
  Australia: { slug: 'australia', continent: 'australia-i-oceania', label: 'Australia' },
  Japan: { slug: 'japonia', continent: 'azja', label: 'Japonia' },
  India: { slug: 'indie', continent: 'azja', label: 'Indie' },
  Tanzania: { slug: 'tanzania', continent: 'afryka', label: 'Tanzania' },
  'New Zealand': { slug: 'nowa-zelandia', continent: 'australia-i-oceania', label: 'Nowa Zelandia' },
  Brazil: { slug: 'brazylia', continent: 'ameryka-poludniowa', label: 'Brazylia' },
  Poland: { slug: 'polska', continent: 'europa', label: 'Polska' },
  Italy: { slug: 'wlochy', continent: 'europa', label: 'Włochy' },
  Iceland: { slug: 'islandia', continent: 'europa', label: 'Islandia' },
  'Cabo Verde': { slug: 'cabo-verde', continent: 'afryka', label: 'Cabo Verde' },
  China: { slug: 'chiny', continent: 'azja', label: 'Chiny' },
  Peru: { slug: 'peru', continent: 'ameryka-poludniowa', label: 'Peru' },
  Colombia: { slug: 'kolumbia', continent: 'ameryka-poludniowa', label: 'Kolumbia' },
  Ecuador: { slug: 'ekwador', continent: 'ameryka-poludniowa', label: 'Ekwador' },
  Antarctica: { slug: 'antarktyda', continent: 'antarktyda', label: 'Antarktyda' },
  Nepal: { slug: 'nepal', continent: 'azja', label: 'Nepal' },
  Mexico: { slug: 'meksyk', continent: 'ameryka-polnocna', label: 'Meksyk' },
  Bolivia: { slug: 'boliwia', continent: 'ameryka-poludniowa', label: 'Boliwia' },
};

/** Kontynenty (kategorie nadrzędne na blogu) — używane w filtrach i na stronie głównej. */
export const continents = [
  { slug: 'azja', label: 'Azja' },
  { slug: 'afryka', label: 'Afryka' },
  { slug: 'ameryka-poludniowa', label: 'Ameryka Południowa' },
  { slug: 'ameryka-polnocna', label: 'Ameryka Północna' },
  { slug: 'europa', label: 'Europa' },
  { slug: 'australia-i-oceania', label: 'Australia i Oceania' },
];

/** Zakresy (długość/szerokość geograficzna) do przybliżania mapy na kontynent: [zachód, południe, wschód, północ]. */
export const regionBounds: Record<string, [number, number, number, number]> = {
  azja: [60, -12, 150, 55],
  afryka: [-20, -36, 52, 38],
  'ameryka-poludniowa': [-82, -56, -34, 13],
  'ameryka-polnocna': [-170, 5, -50, 72],
  europa: [-25, 34, 45, 71],
  'australia-i-oceania': [110, -48, 180, -8],
};
