import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { HomeSlider, type Slide } from '@/components/home-slider';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SocialLinks } from '@/components/social-links';
import { imageSources, tidyExcerpt } from '@/lib/legacy';
import { getPosts } from '@/lib/posts';
import { contact } from '@/lib/site';

export const revalidate = 60;

const tiles = [
  { href: '/mapa', title: 'Nasze podróże', text: 'Mapa świata i wszystkie historie z drogi.', image: '/albums/indonezja/cover.jpg' },
  { href: '/podcasty', title: 'Podcasty', text: 'Rozmowy w radiu i z podróżnikami.', image: '/home/podcasty.jpg' },
  { href: '/wideo', title: 'Wideo', text: 'Filmy z naszego kanału na YouTube.', image: '/albums/nepal-2022-helikopterem-nad-dolina-khumbu/cover.jpg' },
];

export default async function HomePage() {
  const latest = (await getPosts()).filter((post) => post.image).slice(0, 3);
  const slides: Slide[] = latest.map((post) => ({
    slug: post.slug,
    title: post.title.replace(/\s*\.{2,}\s*$/, ''),
    excerpt: tidyExcerpt(post.excerpt).slice(0, 190),
    image: imageSources(post).src,
    imageAlt: post.imageAlt,
    label: post.categories.find((category) => category.slug !== 'dokad-teraz')?.name ?? 'Dziennik z drogi',
    date: post.date,
  }));

  return (
    <>
      <SiteHeader />
      <main id="top">
        <h1 className="sr-only">Świat Czeka: dziennik podróży Anki i Krzyśka</h1>
        <HomeSlider slides={slides} />

        <section className="home-tiles" aria-label="Główne działy">
          {tiles.map((tile) => (
            <Link key={tile.href} className="home-tile" href={tile.href}>
              <Image src={tile.image} alt="" fill sizes="(max-width: 900px) 92vw, 31vw" quality={80} />
              <span className="tile-shade" />
              <span className="tile-copy"><strong>{tile.title}</strong><span>{tile.text}</span><ArrowUpRight size={22} /></span>
            </Link>
          ))}
        </section>

        <section className="home-contact" aria-labelledby="contact-title">
          <div className="home-contact-info">
            <p className="section-label">Bądźmy w kontakcie</p>
            <h2 id="contact-title">Znajdziesz nas <em>w drodze.</em></h2>
            <SocialLinks className="home-social" labels />
            <address>
              <a href={`mailto:${contact.email}`}><Mail size={18} /> {contact.email}</a>
              <a href={`tel:${contact.phone}`}><Phone size={18} /> {contact.phoneLabel}</a>
            </address>
          </div>
          <Link className="home-duo" href="/klub">
            <span className="duo-photo"><Image src="/home/anka-krzysiek.jpg" alt="Anka i Krzysiek na szlaku Green Velo" fill sizes="(max-width: 900px) 92vw, 45vw" quality={80} /></span>
            <span className="duo-copy"><strong>Anka i Krzysiek</strong><span>Rozbijamy stereotypy podróży i pokazujemy, że podróżowanie z Polski do egzotycznych miejsc jest bardziej dostępne, niż się wydaje.</span><span className="duo-link">Poznaj nas <ArrowUpRight size={16} /></span></span>
          </Link>
        </section>
      </main>
      <SiteFooter compact />
    </>
  );
}
