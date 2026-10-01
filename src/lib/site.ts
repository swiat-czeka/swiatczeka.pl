// Jedno miejsce na menu, social media i dane kontaktowe (zgodnie z czekaswiat.pl).
export const nav = [
  { label: 'Nasze podróże', href: '/mapa' },
  { label: 'Dokąd dalej?', href: '/dokad-dalej' },
  { label: 'Wideo', href: '/wideo' },
  { label: 'Podcasty', href: '/podcasty' },
  { label: 'Fotki', href: '/fotki' },
  { label: 'O nas', href: '/klub' },
];

export const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/swiatczeka', icon: 'facebook' },
  { label: 'YouTube', href: 'https://www.youtube.com/czekaswiat', icon: 'youtube' },
  { label: 'Instagram', href: 'https://www.instagram.com/anka_szostak/', icon: 'instagram' },
] as const;

export const contact = { phone: '+48601516274', phoneLabel: '+48 601 516 274', email: 'anka@swiatczeka.pl' };

// Publiczny identyfikator kanału YouTube „Czeka Świat” (nadpisz zmienną YOUTUBE_CHANNEL_ID, jeśli się zmieni).
export const YOUTUBE_CHANNEL_ID = 'UCWqJfykBDuGrvT5lbBErGWg';

/** Film „polecany dla powracających subskrybentów” z YouTube (ID z adresu filmu: youtube.com/watch?v=ID). Pusty = pomijany. */
export const FEATURED_VIDEO_ID = '';

/** Osoby na stronie „O nas”. Zdjęcia z czekaswiat.pl; własne wgraj do public/ i podmień adres. */
export const people = [
  {
    name: 'Anka',
    photo: 'https://czekaswiat.pl/wp-content/uploads/2023/05/Anka-500x500-optimized.jpg',
    text: ['Przyświecają jej idee zrównoważonych podróży i na nich skupia swój ogląd na świat.', 'Uwielbia bikepacking, który od 10 lat determinuje kierunki jej letnich wyjazdów. Aktualnie opracowuje e-booka z wypraw rowerowych.', 'Bardzo nieśpiesznie prowadzi Instagram i bloga.'],
  },
  {
    name: 'Krzysiek',
    photo: 'https://czekaswiat.pl/wp-content/uploads/2023/05/Krzysiek-500x500-optimized.jpg',
    text: ['Krzyśka kręci kręcenie filmów! Codziennie nowe pomysły nakręcają go do szukania materiału na shortsy i filmiki. Montuje je i wrzuca na YouTube i wciąż się uczy :). Nie znosi robić miniatur i opisów, może się kiedyś same ogarną :(', 'Na wiosnę pakuje do sakwy drona i aparat oraz dwie koszulki i jedzie w trasę, którą wymyśla z Anką.'],
  },
  {
    name: 'Martin',
    photo: 'https://czekaswiat.pl/wp-content/uploads/2023/05/Martin-1-500x500-optimized.jpg',
    text: ['Technicznie i merytorycznie pomaga przy prowadzeniu bloga. Czasem dołącza do podróży chillując w hamaku czy na leżaku.'],
  },
];
