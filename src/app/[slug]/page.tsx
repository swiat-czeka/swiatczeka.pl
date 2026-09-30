import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SmartImage } from '@/components/smart-image';
import { PageView } from '@/components/page-view';
import { PostCard, formatDate } from '@/components/post-card';
import { imageSources, metaDescription, metaTitle, plainText, rewriteLegacyHtml, slugify, tidyExcerpt } from '@/lib/legacy';
import { getAdjacentPosts, getPageBySlug, getPostBySlug, getRelatedPosts, toPreview } from '@/lib/posts';
import type { BlogPost } from '@/lib/types';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const post = await getPostBySlug(slug);
  if (!post) {
    const page = await getPageBySlug(slug);
    if (!page) return {};
    const description = page.excerpt || metaDescription(page);
    return { title: page.title, description, alternates: { canonical: `/${page.slug}` }, openGraph: { title: page.title, description, url: `/${page.slug}` } };
  }
  const { src } = imageSources(post);
  const description = metaDescription(post);
  return {
    title: metaTitle(post),
    description,
    alternates: { canonical: `/${post.slug}` },
    openGraph: { type: 'article', title: metaTitle(post), description, url: `/${post.slug}`, publishedTime: post.date, modifiedTime: post.modified, authors: [post.author], images: src ? [src] : [] },
    twitter: { card: 'summary_large_image', title: metaTitle(post), description, images: src ? [src] : [] },
  };
}

function readingMinutes(post: BlogPost) {
  const words = plainText(post.content).split(' ').length;
  return Math.max(1, Math.round(words / 200));
}

function TextBody({ post }: { post: BlogPost }) {
  const blocks = post.content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  const photos = (post.gallery ?? []).slice(1);
  let photo = 0;
  let sinceLast = 0;
  const nodes: React.ReactNode[] = [];
  blocks.forEach((block, index) => {
    if (block.startsWith('## ')) nodes.push(<h2 id={slugify(block.slice(3))} key={`h${index}`}>{block.slice(3)}</h2>);
    else if (block.startsWith('### ')) nodes.push(<h3 key={`h${index}`}>{block.slice(4)}</h3>);
    else {
      nodes.push(<p key={`p${index}`}>{block}</p>);
      sinceLast += 1;
    }
    if (sinceLast >= 3 && photo < photos.length && index < blocks.length - 1) {
      nodes.push(<figure className="story-inline" key={`f${photo}`}><SmartImage src={photos[photo]} alt={`${post.title}, zdjęcie ${photo + 2}`} width={1400} height={933} sizes="(max-width: 900px) 92vw, 780px" quality={85} /></figure>);
      photo += 1;
      sinceLast = 0;
    }
  });
  const rest = photos.slice(photo);
  return (
    <>
      {nodes}
      {rest.length > 0 && <div className={`story-gallery gallery-${Math.min(rest.length, 4)}`}>{rest.map((image, index) => <SmartImage key={image} src={image} alt={`${post.title}, zdjęcie ${photo + index + 2}`} width={1000} height={750} sizes="(max-width: 620px) 92vw, 400px" quality={80} />)}</div>}
    </>
  );
}

export default async function StoryPage({ params }: Props) {
  const slug = (await params).slug;
  const post = await getPostBySlug(slug);
  if (!post) {
    const page = await getPageBySlug(slug);
    if (!page) notFound();
    return <><SiteHeader /><PageView page={page} /><SiteFooter /></>;
  }
  const [{ newer, older }, related] = await Promise.all([getAdjacentPosts(slug), getRelatedPosts(post)]);
  const text = post.format === 'text' || post.id.startsWith('new-');
  const cover = imageSources(post);
  const headings = text ? post.content.split(/\n/).filter((line) => line.startsWith('## ')).map((line) => line.slice(3)) : [];
  const minutes = readingMinutes(post);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metaTitle(post),
    description: metaDescription(post),
    datePublished: post.date,
    dateModified: post.modified || post.date,
    image: cover.src ? [cover.src] : undefined,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'Świat Czeka', url: 'https://swiatczeka.pl' },
    mainEntityOfPage: `https://swiatczeka.pl/${post.slug}`,
    inLanguage: 'pl-PL',
    keywords: post.categories.map((category) => category.name).join(', '),
  };
  return (
    <>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <main className="story-page" id="top">
        <div className="story-topline"><Link href="/#historie"><ArrowLeft size={16} /> Wszystkie historie</Link>{post.categories[0] && <Link href={`/kategoria/${post.categories[0].slug}`}>{post.categories[0].name}</Link>}</div>
        <header className="story-header">
          <div className="story-meta"><span>{post.categories[0]?.name ?? 'Dziennik z drogi'}</span><span>·</span><time dateTime={post.date}>{formatDate(post.date)}</time></div>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="story-lead">{tidyExcerpt(post.excerpt)}</p>}
          <div className="story-byline"><span className="byline-avatar">{post.author.slice(0, 1)}</span><span>Opowiada <strong>{post.author}</strong></span><span className="story-reading">{minutes} min czytania</span></div>
        </header>
        {post.youtubeId ? (
          <div className="story-video"><iframe src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}`} title={post.title} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen /></div>
        ) : cover.src && <figure className="story-cover"><SmartImage src={cover.src} fallback={cover.fallback} alt={post.imageAlt || post.title} fill priority quality={85} sizes="(max-width: 900px) 100vw, 1200px" /></figure>}
        <div className="story-layout">
          <aside className="story-aside">
            <span>Podróżuj z nami</span>
            <div>{post.categories.map((category) => <Link key={category.slug} href={`/kategoria/${category.slug}`}>{category.name} <ArrowUpRight size={12} /></Link>)}</div>
            {headings.length >= 3 && <nav className="story-toc" aria-label="Spis treści"><span>W tym wpisie</span>{headings.map((heading) => <a key={heading} href={`#${slugify(heading)}`}>{heading}</a>)}</nav>}
          </aside>
          <article className={`story-content${text ? '' : ' legacy-content'}`}>
            {text ? <TextBody post={post} /> : <div dangerouslySetInnerHTML={{ __html: rewriteLegacyHtml(post.content) }} />}
            <div className="story-end"><span>✳</span><p>Do zobaczenia<br /><em>gdzieś po drodze.</em></p></div>
          </article>
        </div>
        <nav className="story-pager" aria-label="Poprzedni i następny wpis">
          {[{ post: older, dir: 'prev' as const }, { post: newer, dir: 'next' as const }].map(({ post: item, dir }) => item ? (
            <Link key={dir} href={`/${item.slug}`} rel={dir} className={`pager-card pager-${dir}`}>
              {item.image && <span className="pager-thumb"><SmartImage src={imageSources(item).src} fallback={imageSources(item).fallback} alt="" fill sizes="72px" quality={70} /></span>}
              <span className="pager-copy"><small>{dir === 'prev' ? <><ArrowLeft size={13} /> Starszy wpis</> : <>Nowszy wpis <ArrowRight size={13} /></>}</small><strong>{item.title}</strong></span>
            </Link>
          ) : <span key={dir} />)}
        </nav>
        {related.length > 0 && (
          <section className="story-related" aria-labelledby="related-title">
            <h2 id="related-title">Więcej z tego miejsca</h2>
            <div className="post-grid">{related.map((item, index) => <PostCard key={item.id} post={toPreview(item)} index={index} />)}</div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
