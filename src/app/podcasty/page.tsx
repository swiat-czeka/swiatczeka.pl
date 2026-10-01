import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SmartImage } from '@/components/smart-image';
import { radioPodcasts, youtubePodcasts, type Podcast } from '@/data/podcasts';

export const metadata: Metadata = {
  title: 'Podcasty i rozmowy',
  description: 'Rozmowy o podróżach: Radio Katowice „Za Horyzontem” z Anką i Krzysztofem oraz spotkania z podróżnikami na YouTube.',
  alternates: { canonical: '/podcasty' },
};

function PodcastCard({ podcast }: { podcast: Podcast }) {
  return (
    <article className="podcast-card">
      <a className="podcast-image" href={podcast.href} target="_blank" rel="noopener noreferrer" aria-label={podcast.title}>
        <SmartImage src={podcast.image} alt="" fill sizes="(max-width: 760px) 92vw, 46vw" quality={80} />
      </a>
      {podcast.date && <p className="podcast-date">{podcast.date}</p>}
      <h3><a href={podcast.href} target="_blank" rel="noopener noreferrer">{podcast.title}</a></h3>
      {podcast.text && <p className="podcast-text">{podcast.text}</p>}
      <a className="text-link" href={podcast.href} target="_blank" rel="noopener noreferrer">{podcast.action} <ArrowUpRight size={14} /></a>
    </article>
  );
}

export default function PodcastsPage() {
  return (
    <>
      <SiteHeader />
      <main className="podcast-page" id="top">
        <p className="section-label">Posłuchaj i obejrzyj</p>
        <h1>Podcasty i <em>rozmowy.</em></h1>
        <p className="category-intro">Opowiadamy o podróżach w radiu, a także rozmawiamy z innymi podróżnikami.</p>
        <h2 className="podcast-section">Radio Katowice: „Za Horyzontem”</h2>
        <div className="podcast-grid">{radioPodcasts.map((podcast) => <PodcastCard key={podcast.href} podcast={podcast} />)}</div>
        <h2 className="podcast-section">Rozmowy na YouTube</h2>
        <div className="podcast-grid">{youtubePodcasts.map((podcast) => <PodcastCard key={podcast.href} podcast={podcast} />)}</div>
      </main>
      <SiteFooter />
    </>
  );
}
