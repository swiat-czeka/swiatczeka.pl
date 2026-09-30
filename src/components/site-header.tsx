import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand-link" href="/" aria-label="Świat Czeka — strona główna">
        <Image src="/swiatczeka-logo.jpg" width={2560} height={887} alt="Świat Czeka" priority />
      </Link>
      <nav className="main-nav" aria-label="Główna nawigacja">
        <Link href="/#kierunki">Dokąd dalej</Link>
        <Link href="/kategoria/filmy">Vlog</Link>
        <Link href="/kategoria/fotki">Fotki</Link>
        <Link href="/#historie">Historie</Link>
        <Link className="nav-about" href="/#o-nas">O nas <ArrowUpRight size={14} /></Link>
      </nav>
      <Link className="header-note" href="/#historie">Dziennik z drogi <span>↗</span></Link>
    </header>
  );
}