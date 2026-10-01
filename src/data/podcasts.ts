// Podcasty i rozmowy: teksty podane przez autorkę. Zdjęcie przewodnie: pierwsze zdjęcie z podcastu na stronie radia lub miniatura z YouTube.
export type Podcast = { title: string; href: string; image: string; text?: string; date?: string; action: string };

const radio = 'https://podcasty.radio.katowice.pl/wp-content/uploads';
const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const radioPodcasts: Podcast[] = [
  {
    title: 'Za Horyzontem. Green Velo z Anką Szostak-Gliklich i Krzysztofem Gliklichem',
    href: 'https://podcasty.radio.katowice.pl/za-horyzontem-green-velo-z-anka-i-krzysztofem/',
    image: `${radio}/2025/09/1.-Green-Velo-poczatek-szlaku-Konskie1-1024x825.jpg`,
    text: 'Anka Szostak-Gliklich oraz Krzysztof Gliklich przejechali w 23 dni, nieśpiesznie, 1555 km od Końskich do Malborka przez Kielce, Oblęgorek, Sandomierz, Zwierzyniec, Krasnystaw, Chełm, Sobibór, Włodawę, Kodeń, Hajnówkę, Białowieżę, Białystok, Supraśl, Biebrzę, Augustów, Czarną Hańczę, Suwałki, Stańczyki, Gołdap, Węgorzewo, Bartoszyce, Lidzbark, Elbląg i Malbork. Pięć województw: świętokrzyskie, podkarpackie, lubelskie, podlaskie, warmińsko-mazurskie. Pięć parków narodowych: Roztoczański, Białowieski, Narwiański, Biebrzański, Wigierski. Ludzie, widoki, klimat, lokalne jedzenie… Doskonale przygotowane ścieżki rowerowe i drogi zaadoptowane dla rowerzystów, MOR-y, czyli miejsca obsługi rowerzystów, z wiatami co 10 km oraz bardzo częste oznaczenia trasy. Wyprawa rowerami elektrycznymi, ale z namiotem i sakwami. Doskonałe połączenie biketrampingu z możliwościami. Opowiadają o swojej przygodzie i zapraszają na swoje media społecznościowe.',
    date: 'emisja 11.10.2025',
    action: 'Posłuchaj w Radiu Katowice',
  },
  {
    title: 'Za Horyzontem. Podróże zrównoważone – Anna Szostak-Gliklich i Krzysztof Gliklich',
    href: 'https://podcasty.radio.katowice.pl/za-horyzontem-podroze-zrownowazone/',
    image: `${radio}/2025/03/474614760_9072298202818055_4378695258987562896_n-1024x1024.jpg`,
    text: 'Wiadomo, że „Świat czeka” na każdego, a są tacy, którzy czują to wyzwanie i podobnie jak moi dzisiejsi goście: Anka Szostak-Gliklich i Krzysztof Gliklich całe życie podporządkowują podróżom i odkrywaniu świata. Moi goście sprzedali dom, zmienili pracę i w każdej chwili są gotowi ruszyć w drogę. Porozmawiamy dzisiaj o ich wyborach i o tym, co to znaczy podróżować w sposób zrównoważony. Coraz częściej moi goście zwracają uwagę na to, że samo podróże są ciekawe, ale powinna towarzyszyć im idea.',
    date: 'emisja 22.02.2025',
    action: 'Posłuchaj w Radiu Katowice',
  },
  {
    title: 'Za Horyzontem. Świat Czeka – Anna Szostak i Krzysztof Gliklich',
    href: 'https://podcasty.radio.katowice.pl/za-horyzontem-odc-95-anna-szostak-i-krzysztof-gliklich/',
    image: `${radio}/2023/07/Australia-1-1024x768.jpg`,
    text: 'Niezwykłe emocje, niezwykłe przygody, niezwykłe decyzje, niezwykłe zwroty akcji – słowem piękna podróż przez życie Anki Szostak i jej męża Krzysztofa Gliklicha dzisiaj „Za Horyzontem” to propozycja dla słuchaczy Radia Katowice nie do odrzucenia.',
    date: 'emisja 01.07.2023',
    action: 'Posłuchaj w Radiu Katowice',
  },
  {
    title: 'Za Horyzontem. Świat Czeka – Anna Szostak i Krzysztof Gliklich, część 2',
    href: 'https://podcasty.radio.katowice.pl/za-horyzontem-odc-96-anna-szostak-i-krzysztof-gliklich-cz-2/',
    image: `${radio}/2023/07/Nepal-1-1024x576.jpg`,
    text: 'Zapraszamy na drugą odsłonę opowieści o wędrówce przez życie i świat Anny Szostak-Gliklich i Krzysztofa Gliklicha. Tym razem udamy się do Ameryki Południowej i Środkowej, żeby zakończyć naszą podróż „Za Horyzontem” trekkingami w Afryce i Nepalu. To będzie rozmowa o przyjaźni i bliskości, radości płynącej z poznawania nowych ludzi, o powrotach i wierności wobec swoich ideałów, o spełnianiu marzeń, minimalizmie a przede wszystkim o zachwycającym pięknie świata.',
    date: 'emisja 08.07.2023',
    action: 'Posłuchaj w Radiu Katowice',
  },
];

const youtube = (id: string, title: string): Podcast => ({ title, href: `https://youtu.be/${id}`, image: thumb(id), action: 'Oglądaj na YouTube' });

export const youtubePodcasts: Podcast[] = [
  youtube('zt7EXtLNKW0', 'Poza Szczytem: Krzysztof Wielicki o życiu, walce i wolności'),
  youtube('THHXXrzHsR0', 'Poza Szczytem: Krzysztof Wielicki – Siła przyjaźni w górach'),
  youtube('XCNvSwMpdRs', 'Gdzie lubi wracać Martyna Wojciechowska?'),
  youtube('T0KqaxeYqvY', 'Jak dbać o „Młode Głowy” – Martyna Wojciechowska'),
  youtube('AvwruIIJ0uI', 'Wulkany Ziemi: Cisza. Mróz. Antarktyda – Ewa Wachowicz i Klaudia Cierniak-Kożuch'),
  youtube('eCmORo3AAFs', 'Wulkany Ziemi: Podróż ku Koronie – Ewa Wachowicz, Klaudia Cierniak-Kożuch'),
  youtube('g3yb9HkNEXc', 'O czym marzą ultramaratończycy na krańcach świata? – Piotr Hercog'),
  youtube('xxPc7GnKOaI', 'Sebastian Kawa – Dokąd chcę polecieć TERAZ?'),
  youtube('F39dP_m5Lho', 'Jak nas połączył Świat? – Anka Szostak-Gliklich i Alina Markiewicz'),
];
