import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { SocialLinks } from '@/components/social-links';
import { contact, nav } from '@/lib/site';

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className="site-footer" id="o-nas">
      <div className="footer-top">
        <div>
          <Link className="footer-logo" href="/" aria-label="Świat Czeka — strona główna"><Image src="/swiatczeka-logo.png" width={2576} height={903} alt="Świat Czeka" sizes="200px" /></Link>
          <p>Świat jest wielki. Dobrze go poznawać<br />po kawałku, po swojemu.</p>
        </div>
        {!compact && (
          <div className="footer-contact">
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <a href={`tel:${contact.phone}`}>{contact.phoneLabel}</a>
            <SocialLinks className="footer-social" />
          </div>
        )}
        <a className="back-top" href="#top" aria-label="Wróć na górę">Do góry <ArrowUpRight size={16} /></a>
      </div>
      <div className="footer-bottom"><span>Historie z drogi, od 2005 roku</span><nav aria-label="Stopka">{nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href="/cookie-policy">Polityka cookies</Link><Link className="admin-entry" href="/studio" aria-label="Panel administratora" title="Panel administratora">✳</Link></nav></div>
    </footer>
  );
}