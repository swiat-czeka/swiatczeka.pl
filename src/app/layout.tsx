import type { Metadata } from 'next';
import { Manrope, Newsreader } from 'next/font/google';
import './globals.css';

const sans = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' });
const serif = Newsreader({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://swiatczeka.pl'),
  title: { default: 'Świat Czeka — podróże, które zostają', template: '%s — Świat Czeka' },
  description: 'Prawdziwe historie z drogi, spotkania i miejsca, do których chce się wracać. Podróżniczy dziennik Anki i przyjaciół.',
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    siteName: 'Świat Czeka',
    title: 'Świat Czeka — podróże, które zostają',
    description: 'Prawdziwe historie z drogi, spotkania i miejsca, do których chce się wracać.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}