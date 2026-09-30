'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { nav } from '@/lib/site';
import { SocialLinks } from '@/components/social-links';

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className="site-header">
      <Link className="brand-link" href="/" aria-label="Świat Czeka — strona główna">
        <Image src="/swiatczeka-logo.png" width={2576} height={903} alt="Świat Czeka" sizes="(max-width: 620px) 130px, 220px" priority />
      </Link>
      <nav className="main-nav" aria-label="Główna nawigacja">
        {nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      </nav>
      <SocialLinks className="header-social" />
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Zamknij menu' : 'Otwórz menu'} onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div id="mobile-menu" className={`mobile-menu${open ? ' is-open' : ''}`} hidden={!open}>
        <nav aria-label="Menu mobilne">
          {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
        </nav>
        <SocialLinks />
      </div>
    </header>
  );
}
