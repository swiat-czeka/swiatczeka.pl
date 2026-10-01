import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, Images } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SmartImage } from '@/components/smart-image';
import { getAlbums } from '@/lib/albums';

export const metadata: Metadata = {
  title: 'Fotki z podróży: albumy',
  description: 'Albumy ze zdjęciami z naszych wypraw: Afryka, Ameryka Południowa, Azja i inne. Zobacz zdjęcia albo przejdź do pełnego albumu w Google Photos.',
  alternates: { canonical: '/fotki' },
};

const formatDate = (value: string) => new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: 'long' }).format(new Date(value));

export default function PhotosPage() {
  const albums = getAlbums();
  return (
    <>
      <SiteHeader />
      <main className="albums-page" id="top">
        <p className="section-label">Portfolio</p>
        <h1>Fotki z <em>drogi.</em></h1>
        <p className="category-intro">{albums.length} albumów ze zdjęciami z naszych wypraw. Przy części znajdziesz też link do pełnego albumu w Google Photos.</p>
        <div className="album-grid">
          {albums.map((album, index) => {
            const onSite = album.photos.length > 0;
            const content = (
              <>
                <span className="album-cover">
                  {album.cover && <SmartImage src={album.cover} alt="" fill sizes="(max-width: 620px) 92vw, (max-width: 1100px) 46vw, 30vw" quality={75} loading={index < 6 ? 'eager' : 'lazy'} />}
                  <span className="album-badge">{onSite ? <><Images size={14} /> {album.photos.length + 1} zdjęć</> : <><ExternalLink size={14} /> Google Photos</>}</span>
                </span>
                <span className="album-title">{album.title}</span>
                <span className="album-date">{formatDate(album.date)}</span>
              </>
            );
            return onSite
              ? <Link key={album.slug} className="album-card" href={`/fotki/${album.slug}`}>{content}</Link>
              : <a key={album.slug} className="album-card" href={album.google} target="_blank" rel="noopener noreferrer">{content}</a>;
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
