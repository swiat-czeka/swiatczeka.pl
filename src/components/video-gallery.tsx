'use client';

import Image from 'next/image';
import { useDeferredValue, useState } from 'react';
import { Play, Search, X } from 'lucide-react';
import type { Video } from '@/lib/videos';

const PAGE = 18;

function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  return (
    <article className="video-card">
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
    </article>
  );
}

export function VideoGallery({ videos }: { videos: Video[] }) {
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE);
  const deferred = useDeferredValue(query).trim().toLocaleLowerCase('pl');
  const filtered = deferred ? videos.filter((video) => video.title.toLocaleLowerCase('pl').includes(deferred)) : videos;
  return (
    <div className="video-gallery">
      <div className="archive-tools">
        <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(PAGE); }} placeholder="Szukaj filmu, miejsca…" aria-label="Szukaj filmu" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Wyczyść wyszukiwanie"><X size={16} /></button>}</label>
        <span className="result-count">{filtered.length.toLocaleString('pl-PL')} filmów</span>
      </div>
      {filtered.length ? <div className="video-grid">{filtered.slice(0, visible).map((video) => <VideoCard key={video.id} video={video} />)}</div> : <div className="empty-state"><span>Nic nie znaleziono.</span><p>Spróbuj innego słowa, np. nazwy kraju.</p></div>}
      {visible < filtered.length && <button type="button" className="load-more" onClick={() => setVisible(visible + PAGE)}>Pokaż kolejne filmy <span>↓</span></button>}
    </div>
  );
}
