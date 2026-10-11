import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Zrównoważone podróże: 8 zasad',
  description: 'Osiem prostych zasad podróżowania zrównoważonego: wolniej, lżej, lokalnie i z szacunkiem. Z rowerowych i górskich wypraw Anki i Krzyśka.',
  alternates: { canonical: '/zrownowazone-podroze' },
};

const principles = [
  { title: 'Wolniej znaczy lepiej', text: 'Zamiast odhaczać miejsca, zostajemy w nich dłużej. Nieśpieszna podróż to mniej przesiadek, więcej rozmów z ludźmi i prawdziwy odpoczynek zamiast wyścigu z planem.' },
  { title: 'Wybieraj wolniejszy transport', text: 'Rower, pociąg, własne nogi. Samolot tylko wtedy, gdy innej drogi po prostu nie ma. Trasy takie jak Green Velo czy Odra-Nysa pokazują, że do przygody nie trzeba się spieszyć.' },
  { title: 'Pakuj mniej', text: 'Sakwy mają swoje granice i bardzo dobrze. Dwie koszulki wystarczą. Lżejszy bagaż to mniej paliwa, mniej stresu i więcej swobody po drodze.' },
  { title: 'Jedz i nocuj lokalnie', text: 'Pieniądze zostają tam, gdzie je wydajesz: u rodzin, w małych barach i pensjonatach. Lokalne jedzenie to też najlepszy sposób, żeby poczuć klimat miejsca.' },
  { title: 'Szanuj ludzi i ich zwyczaje', text: 'Zapytaj, zanim zrobisz zdjęcie. Naucz się kilku słów w lokalnym języku. Pamiętaj, że jesteś gościem i że to, co dla Ciebie jest egzotyką, dla innych jest codziennością.' },
  { title: 'Zostaw miejsce lepsze, niż zastałeś', text: 'Własna butelka na wodę, mniej plastiku, śmieci zabieramy ze sobą. Trzymamy się szlaków, nie płoszymy zwierząt i szanujemy parki narodowe.' },
  { title: 'Wracaj tam, gdzie Ci dobrze', text: 'Do części krajów wracaliśmy kilkakrotnie, jak do domu. Głębsza znajomość jednego miejsca daje więcej niż kolejna pieczątka w paszporcie.' },
  { title: 'Zadbaj o równowagę i idee', text: 'Podróż nie jest ucieczką od życia, tylko jego częścią. Zostaw w planie luz i odpoczynek, a za wyprawą niech stoi jakaś idea: ciekawość, ruch, spotkania z ludźmi.' },
];

const photos = [
  { src: '/albums/trasa-odra-nysa/cover.jpg', alt: 'Anka i Krzysiek na trasie Odra-Nysa', caption: 'Odra-Nysa: nieśpiesznie, na dwóch kółkach' },
  { src: '/albums/eurovelo-10-2021-rowerem-nad-baltykiem/cover.jpg', alt: 'Anka i Krzysiek na promie nad Bałtykiem', caption: 'EuroVelo 10: prom zamiast samochodu' },
  { src: '/albums/eurovelo-10-2021-rowerem-nad-baltykiem/01.jpg', alt: 'Rowery z sakwami na dworcu', caption: 'Pociąg, rower i sakwy' },
  { src: '/albums/szlak-swietokrzyski-2020-254-km-przygody/cover.jpg', alt: 'Wędrowcy na Szlaku Świętokrzyskim', caption: 'Szlak Świętokrzyski: 254 km pieszo' },
];

export default function SustainablePage() {
  return (
    <>
      <SiteHeader />
      <main className="sustain-page" id="top">
        <header className="sustain-hero">
          <Image src="/albums/mazurska-petla-rowerowa-bez-komarow/cover.jpg" alt="" fill priority quality={80} sizes="100vw" />
          <div className="sustain-hero-shade" />
          <div className="sustain-hero-copy">
            <p className="slide-kicker"><span className="kicker-dot" /> Jak podróżujemy</p>
            <h1>Zrównoważone <em>podróże.</em></h1>
            <p>Osiem prostych zasad, dzięki którym i miejsce, i ludzie, i Ty wracacie z podróży w lepszej formie.</p>
          </div>
        </header>

        <section className="sustain-intro">
          <p>Zrównoważona podróż to taka, po której nikt nie ma gorzej: ani miejsce, które odwiedzasz, ani ludzie, którzy w nim mieszkają, ani Ty sam. Nie chodzi o perfekcję. Chodzi o kilka dobrych nawyków, które z czasem stają się drugą naturą.</p>
          <p>Poniżej osiem zasad, które przyświecają naszym wyprawom, rowerowym, górskim i dalekim.</p>
        </section>

        <ol className="principles">
          {principles.map((item, index) => (
            <li key={item.title}>
              <span className="principle-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>

        <section className="sustain-photos" aria-label="Zdjęcia z naszych tras">
          {photos.map((photo) => (
            <figure key={photo.src}>
              <div><Image src={photo.src} alt={photo.alt} fill quality={80} sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 23vw" /></div>
              <figcaption>{photo.caption}</figcaption>
            </figure>
          ))}
        </section>

        <section className="sustain-video" aria-labelledby="sustain-video-title">
          <h2 id="sustain-video-title">Zobacz, jak to wygląda w drodze</h2>
          <div className="story-video">
            <iframe src="https://www.youtube-nocookie.com/embed/dWLeMzSU1ww" title="Odra Nysa, odcinek 3" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
          </div>
          <p className="video-caption">Odra Nysa, odcinek 3. Więcej filmów znajdziesz na stronie <Link href="/wideo">Wideo</Link>.</p>
        </section>

        <section className="sustain-more">
          <h2>Chcesz posłuchać więcej?</h2>
          <p>O podróżowaniu zrównoważonym opowiadamy w radiowym podcaście „Za Horyzontem”.</p>
          <Link className="landing-cta" href="/podcasty">Przejdź do podcastów <ArrowUpRight size={17} /></Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
