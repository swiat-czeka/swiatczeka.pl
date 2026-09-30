import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { SocialLinks } from '@/components/social-links';

export function SiteFooter() {
  return (
    <footer className="site-footer" id="o-nas">
      <div className="footer-top">
        <div>
          <Link className="footer-logo" href="/" aria-label="Świat Czeka — strona główna"><Image src="/swiatczeka-logo.jpg" width={2560} height={887} alt="Świat Czeka" /></Link>
          <p>Świat jest wielki. Dobrze go poznawać<br />po kawałku, po swojemu.</p>
        </div>
        <SocialLinks className="footer-social" />
        <a className="back-top" href="#top" aria-label="Wróć na górę">Do góry <ArrowUpRight size={16} /></a>
      </div>
      <div className="footer-bottom"><span>Historie z drogi, od 2005 roku</span><span>Polska · wszędzie</span></div>
    </footer>
  );
}