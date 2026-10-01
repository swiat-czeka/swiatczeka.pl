import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { VideoGallery } from '@/components/video-gallery';
import { YOUTUBE_CHANNEL_ID } from '@/lib/site';
import { getFeaturedVideos, getVideos } from '@/lib/videos';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Wideo z podróży',
  description: 'Filmy z naszych wypraw: rowerem, pieszo i w drodze. Cały kanał Czeka Świat w jednym miejscu.',
  alternates: { canonical: '/wideo' },
};

export default async function VideoPage() {
  const videos = await getVideos();
  const featured = await getFeaturedVideos(videos);
  return (
    <>
      <SiteHeader />
      <main className="video-page" id="top">
        <p className="section-label">Kanał Czeka Świat</p>
        <h1>Wideo z <em>drogi.</em></h1>
        <p className="category-intro">{videos.length.toLocaleString('pl-PL')} filmów z naszych podróży. Kliknij, żeby obejrzeć.</p>
        <a className="hero-link" href={`https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer">Subskrybuj na YouTube <ArrowUpRight size={16} /></a>
        <VideoGallery videos={videos.filter((video) => !featured.some((item) => item.video.id === video.id))} featured={featured} />
      </main>
      <SiteFooter />
    </>
  );
}
