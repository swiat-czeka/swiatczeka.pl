// Jedno miejsce na menu, social media i dane kontaktowe (zgodnie z czekaswiat.pl).
export const nav = [
  { label: 'Nasze podróże', href: '/mapa' },
  { label: 'Dokąd dalej?', href: '/dokad-dalej' },
  { label: 'Vlog', href: '/kategoria/filmy' },
  { label: 'Fotki', href: '/kategoria/fotki' },
  { label: 'O nas', href: '/klub' },
];

export const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/swiatczeka', icon: 'facebook' },
  { label: 'YouTube', href: 'https://www.youtube.com/czekaswiat', icon: 'youtube' },
  { label: 'Instagram', href: 'https://www.instagram.com/anka_szostak/', icon: 'instagram' },
] as const;

export const contact = { phone: '+48601516274', phoneLabel: '+48 601 516 274', email: 'anka@swiatczeka.pl' };

// Publiczny identyfikator kanału YouTube „Czeka Świat” (nadpisz zmienną YOUTUBE_CHANNEL_ID, jeśli się zmieni).
export const YOUTUBE_CHANNEL_ID = 'UCeXnkFPMS4Zf9lK4MP673eg';
