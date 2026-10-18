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
  { title: 'Pakuj mniej', text: 'Każdy kilogram bagażu to większy ślad węglowy, zwłaszcza w samolocie. Weź własne mydło w kostce i butelkę z filtrem zamiast kupować wodę w plastikowych butelkach. Sprawdź też krem do opalania: popularne filtry UV (oksybenzon, oktinostat) niszczą rafy koralowe, więc przed nurkowaniem wybieraj kremy przyjazne rafie.' },
  { title: 'Wybieraj wolniejszy transport', text: 'Samolot to 2–3% światowej emisji CO₂ i zwykle nie ma dla niego zamiennika, ale na krótszych trasach lepszy jest pociąg albo prom. Na miejscu zamiast auta z wypożyczalni wybierz transport publiczny, skuter lub rower: taniej, lokalniej i często większa przygoda. Jeśli nie da się zwiedzać inaczej niż wypożyczonym autem, namów na wyjazd przyjaciół: zużycie paliwa i koszty ekologiczne zmniejszą się o połowę.' },
  { title: 'Nocuj lokalnie', text: 'Mały pensjonat albo kwatera u gospodarzy zostawiają pieniądze na miejscu, a wielkie hotele dają mieszkańcom głównie niskopłatną pracę. W formule all-inclusive turyści prawie nie wychodzą z hotelu, więc lokalne bary i przewodnicy nie zarabiają nic. Szukaj miejsc, które dbają o środowisko, na przykład korzystają z energii słonecznej, z ekologicznych szamb oraz uzupełniają wodę w szklanych butelkach.' },
  { title: 'Oszczędzaj wodę i energię', text: 'Jedna osoba w pięciogwiazdkowym hotelu zużywa nawet 522 litry wody dziennie. Nie każ prać codziennie ręczników, krócej korzystaj z prysznica, ogranicz klimatyzację i kosmetyki w jednorazowych opakowaniach. W wielu turystycznych miejscach brakuje wody, a pierwszeństwo mają hotele, nie mieszkańcy.' },
  { title: 'Jedz i kupuj lokalnie', text: 'Nie obawiaj się zamawiać nieznanych Ci potraw: jak Ci nie przypadną do gustu, na pewno nie umrzesz z głodu, zawsze możesz przekąsić owoce. Lokalne jedzenie to najlepszy sposób, żeby poznać miejsce, ludzi i ich kulturę. Podwójne korzyści dla otoczenia: produkty z okolicy, bez kosztów transportu, i restauracje czy sklepiki prowadzone przez mieszkańców.' },
  { title: 'Pamiętaj o sile swoich pieniędzy', text: 'Wspieraj lokalną gospodarkę: noclegi, transport, przewodników, miejscowe targi. Najlepsze pamiątki nie pochodzą z fabryk w Chinach (chyba że akurat tam jesteś), tylko od lokalnych rzemieślników. Nie kupuj głupich pamiątek, kupuj to, co naprawdę potrzebujesz, np. bagażnik do roweru, jak Ci się właśnie zepsuje stary podczas biketrampingu.' },
  { title: 'Szanuj ludzi, zwierzęta i przyrodę', text: 'Przejażdżki na słoniach i delfinaria okupione są cierpieniem zwierząt. Jeśli chcesz zobaczyć zwierzęta, wybierz sprawdzone rezerwaty i sanktuaria. Pamiętaj też, że dla ludzi, których odwiedzasz, to codzienność, a nie egzotyka: naucz się kilku słów w ich języku, pytaj, zanim zrobisz zdjęcie, zostaw miejsce lepsze, niż je zastałeś.' },
  { title: 'Czasem zostań w domu', text: 'Staycation, czyli wakacje w miejscu zamieszkania: odkrywaj swoje miasto, nadrabiaj zaległości kulturalne, sprawdź okoliczne atrakcje turystyczne. A jeżeli tak jak my nie możesz usiedzieć na miejscu: weź plecak i idź na pieszą wędrówkę albo jeszcze lepiej zapakuj sakwy i jedź rowerem na długodystansowy szlak.' },
];

const photos = [
  { src: '/sustainable/woda-plaza.jpg', alt: 'Butelka wody i karta płatnicza na plaży', caption: 'Pakowanie: im mniej, tym lepiej' },
  { src: '/sustainable/riksze-indie.jpg', alt: 'Riksze na ulicy w Indiach', caption: 'Rikszą po Indiach: lokalny transport zamiast wynajętego auta' },
  { src: '/sustainable/skuter.jpg', alt: 'Skuter na wiejskiej drodze', caption: 'Skuterem, jak jeżdżą miejscowi' },
  { src: '/sustainable/prom.jpg', alt: 'Wejście na pokład promu z plecakami', caption: 'Promem zamiast samolotem' },
  { src: '/sustainable/lodza-dingboche.jpg', alt: 'Lodża Khumbu Resort w Dingboche, Nepal', caption: 'Lokalna lodża w Dingboche w Nepalu' },
  { src: '/sustainable/chatki-plaza.jpg', alt: 'Anka przed chatkami z liści palmowych na plaży', caption: 'Nocleg w lokalnych chatkach na plaży na Zanzibarze' },
  { src: '/sustainable/hamak-amazonka.jpg', alt: 'Anka w hamaku na pokładzie rzecznego statku', caption: 'Noclegi na hamakach na pokładzie cargo łodzi po Amazonii' },
  { src: '/sustainable/chatka-filipiny.jpg', alt: 'Bambusowa chatka na Filipinach', caption: 'Bambusowa chatka na Filipinach: nocleg u gospodarzy' },
  { src: '/sustainable/autobus-puerto-sabang.jpg', alt: 'Lokalny autobus do Puerto Sabang', caption: 'Lokalnym autobusem do Puerto Sabang na Filipinach' },
  { src: '/albums/trasa-odra-nysa/cover.jpg', alt: 'Anka i Krzysiek na trasie Odra-Nysa', caption: 'Odra-Nysa: nieśpiesznie, na dwóch kółkach' },
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
