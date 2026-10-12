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
  { title: 'Pakuj mniej', text: 'Każdy kilogram bagażu to większy ślad węglowy, zwłaszcza w samolocie. Weź własne mydło w kostce i butelkę z filtrem zamiast plastiku z hotelu. Sprawdź też krem do opalania: popularne filtry UV (oksybenzon, oktinostat) niszczą rafy koralowe, więc przed nurkowaniem wybieraj kremy przyjazne rafie.' },
  { title: 'Wybieraj wolniejszy transport', text: 'Samolot to 2–3% światowej emisji CO₂ i zwykle nie ma dla niego zamiennika, ale na krótszych trasach lepszy jest pociąg lub rower. Sam lot Poznań–Cagliari i z powrotem to 272 kg CO₂ w klasie ekonomicznej, a w biznesowej dwa razy tyle. Na miejscu zamiast auta z wypożyczalni wybierz transport publiczny albo rower: taniej, lokalniej i często większa przygoda.' },
  { title: 'Nocuj lokalnie', text: 'Mały pensjonat albo kwatera u gospodarzy zostawiają pieniądze na miejscu, a wielkie hotele dają mieszkańcom głównie niskopłatną pracę. W formule all-inclusive turyści prawie nie wychodzą z hotelu, więc lokalne bary i przewodnicy nie zarabiają nic. Szukaj miejsc, które dbają o środowisko, na przykład korzystają z energii słonecznej.' },
  { title: 'Oszczędzaj wodę i energię', text: 'Jedna osoba w pięciogwiazdkowym hotelu zużywa nawet 522 litry wody dziennie. Nie każ prać codziennie ręczników, krócej korzystaj z prysznica, ogranicz klimatyzację i kosmetyki w jednorazowych opakowaniach. W wielu turystycznych miejscach brakuje wody, a pierwszeństwo mają hotele, nie mieszkańcy.' },
  { title: 'Jedz lokalnie', text: 'Lokalne jedzenie to najlepszy sposób, żeby poznać miejsce, ludzi i ich kulturę. Podwójnie lokalnie: produkty z okolicy, bez kosztów transportu, i restauracje czy sklepiki prowadzone przez mieszkańców.' },
  { title: 'Pamiętaj o sile swoich pieniędzy', text: 'Na Fidżi aż 60% pieniędzy wydawanych przez turystów nie zostaje na wyspie. Wspieraj lokalną gospodarkę: noclegi, transport, przewodników, targi. Najlepsze pamiątki nie pochodzą z fabryk w Chinach (chyba że akurat tam jesteś), tylko od lokalnych rzemieślników.' },
  { title: 'Szanuj ludzi, zwierzęta i przyrodę', text: 'Przejażdżki na słoniach i delfinaria okupione są cierpieniem zwierząt. Jeśli chcesz zobaczyć zwierzęta, wybierz sprawdzone rezerwaty i sanktuaria. Pamiętaj też, że dla ludzi, których odwiedzasz, to codzienność, a nie egzotyka: pytaj, zanim zrobisz zdjęcie, zostaw miejsce lepsze, niż je zastałeś, i naucz się kilku słów w ich języku.' },
  { title: 'Czasem zostań w domu', text: 'Staycation, czyli urlop z powrotem do własnego łóżka na noc: odkrywaj swoje miasto, nadrabiaj zaległości kulturalne, jedź na jednodniowe wycieczki rowerem. Oszczędza czas i pieniądze, jest dobry dla klimatu i też dostarcza wrażeń. A kiedy już ruszasz w świat, zwalniaj i wracaj tam, gdzie Ci dobrze: do części krajów wracamy jak do domu.' },
];

const photos = [
  { src: '/sustainable/pakowanie.jpg', alt: 'Rzeczy rozłożone przed spakowaniem plecaka', caption: 'Pakowanie: im mniej, tym lepiej' },
  { src: '/sustainable/riksze-indie.jpg', alt: 'Riksze na ulicy w Indiach', caption: 'Rikszą po Indiach: lokalny transport zamiast wynajętego auta' },
  { src: '/sustainable/skuter.jpg', alt: 'Skuter na wiejskiej drodze', caption: 'Skuterem, jak jeżdżą miejscowi' },
  { src: '/sustainable/lodza-dingboche.jpg', alt: 'Lodża Khumbu Resort w Dingboche, Nepal', caption: 'Lokalna lodża w Dingboche w Nepalu' },
  { src: '/sustainable/chatki-plaza.jpg', alt: 'Anka przed chatkami z liści palmowych na plaży', caption: 'Chatki na plaży: nocleg w lokalnym stylu' },
  { src: '/sustainable/hamak-amazonka.jpg', alt: 'Anka w hamaku na pokładzie rzecznego statku', caption: 'Hamak na pokładzie: tak podróżuje się lokalnie po rzece' },
  { src: '/sustainable/chatka-filipiny.jpg', alt: 'Bambusowa chatka na Filipinach', caption: 'Bambusowa chatka: nocleg u lokalnych gospodarzy' },
  { src: '/sustainable/autobus-puerto-sabang.jpg', alt: 'Lokalny autobus do Puerto Sabang', caption: 'Lokalnym autobusem do Puerto Sabang' },
  { src: '/sustainable/namiot-gory.jpg', alt: 'Obóz z namiotem w górach', caption: 'Prosty obóz w górach: mało bagażu, dużo przyrody' },
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
          <p>Zrównoważona podróż to taka, po której nikt nie ma gorzej: ani miejsce, które odwiedzasz, ani ludzie, którzy w nim mieszkają, ani Ty sam. Turystyka daje pracę setkom milionów ludzi, ale masowa i nieprzemyślana niszczy to, co chcemy zobaczyć: Wenecja, Barcelona czy Praga stały się ofiarami własnej popularności (overtourism). Nie chodzi o to, żeby przestać jeździć po świecie, tylko żeby pamiętać o śladach, które po sobie zostawiamy.</p>
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
