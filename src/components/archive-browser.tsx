'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import { LoaderCircle, Search, X } from 'lucide-react';
import { PostCard } from '@/components/post-card';
import type { PostPreview } from '@/lib/types';

type ArchiveResponse = { posts: PostPreview[]; total: number; hasMore: boolean };

export function ArchiveBrowser({ initialPosts, categories, total, initialCategory = '' }: {
  initialPosts: PostPreview[];
  categories: { name: string; slug: string }[];
  total: number;
  initialCategory?: string;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [count, setCount] = useState(total);
  const [hasMore, setHasMore] = useState(total > initialPosts.length);
  const [loading, setLoading] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (!deferredQuery && category === initialCategory) {
      setPosts(initialPosts);
      setCount(total);
      setHasMore(total > initialPosts.length);
      return;
    }
    const controller = new AbortController();
    const params = new URLSearchParams({ q: deferredQuery, category });
    setLoading(true);
    fetch(`/api/archive?${params}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<ArchiveResponse>)
      .then((result) => {
        setPosts(result.posts);
        setCount(result.total);
        setHasMore(result.hasMore);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== 'AbortError') console.error(error);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [deferredQuery, category, initialCategory, initialPosts, total]);

  async function loadMore() {
    setLoading(true);
    const params = new URLSearchParams({ q: deferredQuery, category, offset: String(posts.length) });
    try {
      const response = await fetch(`/api/archive?${params}`);
      const result = await response.json() as ArchiveResponse;
      setPosts((current) => [...current, ...result.posts]);
      setCount(result.total);
      setHasMore(result.hasMore);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="archive-browser">
      <div className="archive-tools">
        <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj opowieści, miejsca…" aria-label="Szukaj w archiwum" />{query && <button onClick={() => setQuery('')} aria-label="Wyczyść wyszukiwanie"><X size={16} /></button>}</label>
        <div className="category-filters" aria-label="Filtruj według miejsca">
          <button className={!category ? 'filter-active' : ''} onClick={() => setCategory('')}>Wszystkie</button>
          {categories.map((item) => <button className={category === item.slug ? 'filter-active' : ''} key={item.slug} onClick={() => setCategory(category === item.slug ? '' : item.slug)}>{item.name}</button>)}
        </div>
        <span className="result-count">{loading ? 'Szukam…' : `${count.toLocaleString('pl-PL')} historii`}</span>
      </div>
      {posts.length ? <div className="post-grid">{posts.map((post, index) => <PostCard key={post.id} post={post} index={index} />)}</div> : <div className="empty-state"><span>Bez pośpiechu.</span><p>Nie ma tu jeszcze takiej historii. Spróbuj innego miejsca.</p></div>}
      {hasMore && <button className="load-more" onClick={loadMore} disabled={loading}>{loading ? <LoaderCircle className="spin" size={17} /> : null} Pokaż kolejne historie <span>↓</span></button>}
    </div>
  );
}