import Link from 'next/link';
import { SmartImage } from '@/components/smart-image';
import type { PostPreview } from '@/lib/types';

export function PostCard({ post, index = 0 }: { post: PostPreview; index?: number }) {
  const region = post.categories.find((category) => category.slug !== 'dokad-teraz') ?? post.categories[0];
  return (
    <article className="post-card" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <Link className="post-card-image" href={`/wpis/${post.slug}`} aria-label={`Czytaj: ${post.title}`}>
        {post.image ? <SmartImage src={post.image} fallback={post.imageFallback} alt={post.imageAlt || post.title} fill quality={80} sizes="(max-width: 620px) 92vw, (max-width: 1100px) 46vw, 30vw" /> : <div className="image-placeholder">świat czeka</div>}
        {region && <span className="image-location">{region.name}</span>}
      </Link>
      <div className="post-card-copy">
        <div className="eyebrow"><time dateTime={post.date}>{formatDate(post.date)}</time><span>·</span><span>{post.author}</span></div>
        <h3><Link href={`/wpis/${post.slug}`}>{post.title}</Link></h3>
        {post.excerpt && <p>{post.excerpt}</p>}
        <Link className="text-link" href={`/wpis/${post.slug}`}>Czytaj historię <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  );
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
}