'use client';

import Image from 'next/image';
import { useDeferredValue, useState } from 'react';
import { Play, Search, X } from 'lucide-react';
import type { FeaturedVideo, Video } from '@/lib/videos';

const PAGE = 18;

function VideoCard({ video, label }: { video: Video; label?: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <article className={`video-card${label ? ' video-featured' : ''}`}>
      {label && <span className="video-label">{label}</span>}
      <div className="video-frame">
        {playing ? (
          <iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`} title={video.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={`Odtwórz: ${video.title}`}>
            <Image src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" fill sizes="(max-width: 620px) 92vw, (max-width: 1100px) 46vw, 30vw" quality={75} />
            <span className="video-play"><Play size={22} fill="currentColor" /></span>
          </button>
        )}
      </div>
      <h3>{video.title}</h3>
      {(video.date || video.duration) && <p className="video-meta">{[video.date && new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(video.date)), video.duration].filter(Boolean).join(' · ')}</p>}
      {video.description && <p className="video-desc">{video.description}</p>}
    </article>
  );
}

export function VideoGallery({ videos, featured = [] }: { videos: Video[]; featured?: FeaturedVideo[] }) {
  const [sort, setSort] = useState<'newest' | 'views'>('newest');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE);
  const deferred = useDeferredValue(query).trim().toLocaleLowerCase('pl');
  const matched = deferred ? videos.filter((video) => `${video.title} ${video.description ?? ''}`.toLocaleLowerCase('pl').includes(deferred)) : videos;
  const filtered = sort === 'views' ? [...matched].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)) : matched;
  return (
    <div className="video-gallery">
      {featured.length > 0 && !deferred && (
        <section className="video-featured-row" aria-label="Wyróżnione filmy">
          {featured.map((item) => <VideoCard key={item.video.id} video={item.video} label={item.label} />)}
        </section>
      )}
      <div className="archive-tools">
        <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(PAGE); }} placeholder="Szukaj filmu, miejsca…" aria-label="Szukaj filmu" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Wyczyść wyszukiwanie"><X size={16} /></button>}</label>
        <label className="sort-box"><span>Sortuj:</span><select value={sort} onChange={(event) => { setSort(event.target.value as 'newest' | 'views'); setVisible(PAGE); }} aria-label="Sortowanie filmów"><option value="newest">Najnowsze</option><option value="views">Najczęściej oglądane</option></select></label>
        <span className="result-count">{filtered.length.toLocaleString('pl-PL')} filmów</span>
      </div>
      {filtered.length ? <div className="video-grid">{filtered.slice(0, visible).map((video) => <VideoCard key={video.id} video={video} />)}</div> : <div className="empty-state"><span>Nic nie znaleziono.</span><p>Spróbuj innego słowa, np. nazwy kraju.</p></div>}
      {visible < filtered.length && <button type="button" className="load-more" onClick={() => setVisible(visible + PAGE)}>Pokaż kolejne filmy <span>↓</span></button>}
    </div>
  );
}
