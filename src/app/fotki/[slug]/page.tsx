import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SmartImage } from '@/components/smart-image';
import { getAlbum, getAlbums } from '@/lib/albums';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAlbums().map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const album = getAlbum((await params).slug);
  if (!album) return {};
  return {
    title: album.title,
    description: `Zdjęcia z albumu „${album.title}”: ${album.photos.length + 1} fotografii z naszej podróży.`,
    alternates: { canonical: `/fotki/${album.slug}` },
    openGraph: { title: album.title, images: album.cover ? [album.cover] : [] },
  };
}

export default async function AlbumPage({ params }: Props) {
  const album = getAlbum((await params).slug);
  if (!album) notFound();
  const photos = [album.cover, ...album.photos].filter(Boolean);
  return (
    <>
      <SiteHeader />
      <main className="album-page" id="top">
        <Link className="back-link" href="/fotki"><ArrowLeft size={16} /> Wszystkie albumy</Link>
        <p className="section-label">{new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: 'long' }).format(new Date(album.date))}</p>
        <h1>{album.title}</h1>
        {album.google && <a className="hero-link" href={album.google} target="_blank" rel="noopener noreferrer">{album.source === 'google' ? 'Zobacz wszystkie zdjęcia w Google Photos' : 'Pełny album w Google Photos'} <ExternalLink size={16} /></a>}
        <div className="photo-wall">
          {photos.map((url, index) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" aria-label={`Zdjęcie ${index + 1} w pełnym rozmiarze`}>
              <SmartImage src={url} alt={`${album.title}, zdjęcie ${index + 1}`} width={900} height={675} sizes="(max-width: 620px) 92vw, (max-width: 1100px) 46vw, 30vw" quality={75} loading={index < 4 ? 'eager' : 'lazy'} />
            </a>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
