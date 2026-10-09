'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { SmartImage } from '@/components/smart-image';

export type Slide = { slug: string; title: string; excerpt: string; image: string; imageAlt: string; label: string; date: string };

const INTERVAL = 7000;

/** Główny slider: trzy ostatnie wpisy. Zmienia się sam, zatrzymuje się po najechaniu i przy ustawieniu „ogranicz ruch”. */
export function HomeSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const hovering = useRef(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const go = useCallback((next: number) => setIndex((next + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || reduced || slides.length < 2) return;
    const timer = window.setInterval(() => { if (!hovering.current) setIndex((current) => (current + 1) % slides.length); }, INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused, reduced, slides.length]);

  if (!slides.length) return null;
  const date = (value: string) => new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));

  return (
    <section
      className="home-slider"
      aria-roledescription="karuzela"
      aria-label="Najnowsze historie"
      onMouseEnter={() => { hovering.current = true; }}
      onMouseLeave={() => { hovering.current = false; }}
      onKeyDown={(event) => { if (event.key === 'ArrowLeft') go(index - 1); if (event.key === 'ArrowRight') go(index + 1); }}
    >
      {slides.map((slide, position) => (
        <article key={slide.slug} className={`slide${position === index ? ' is-active' : ''}`} aria-roledescription="slajd" aria-label={`${position + 1} z ${slides.length}`} aria-hidden={position !== index}>
          {slide.image && <SmartImage className="slide-image" src={slide.image} alt={slide.imageAlt || slide.title} fill priority={position === 0} quality={85} sizes="100vw" />}
          <div className="slide-shade" />
          <div className="slide-copy">
            <p className="slide-kicker"><span className="kicker-dot" /> {slide.label} · {date(slide.date)}</p>
            <h2>{slide.title}</h2>
            {slide.excerpt && <p className="slide-excerpt">{slide.excerpt}</p>}
            <Link className="hero-link" href={`/${slide.slug}`} tabIndex={position === index ? 0 : -1}>Czytaj historię <ArrowRight size={16} /></Link>
          </div>
        </article>
      ))}
      {slides.length > 1 && (
        <div className="slider-controls">
          <button type="button" onClick={() => go(index - 1)} aria-label="Poprzedni slajd"><ChevronLeft size={22} /></button>
          <div className="slider-dots" role="tablist" aria-label="Wybór slajdu">
            {slides.map((slide, position) => <button key={slide.slug} type="button" role="tab" aria-selected={position === index} aria-label={`Slajd ${position + 1}: ${slide.title}`} className={position === index ? 'dot-active' : ''} onClick={() => go(position)} />)}
          </div>
          <button type="button" onClick={() => go(index + 1)} aria-label="Następny slajd"><ChevronRight size={22} /></button>
          <button type="button" className="slider-pause" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Wznów automatyczną zmianę slajdów' : 'Zatrzymaj automatyczną zmianę slajdów'}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
        </div>
      )}
    </section>
  );
}
