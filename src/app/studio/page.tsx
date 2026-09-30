import { isAdmin } from '@/lib/auth';
import { htmlToText, imageSources } from '@/lib/legacy';
import { getAllPosts } from '@/lib/posts';
import { getStats, statsConfigured } from '@/lib/stats';
import { Studio, type DraftItem } from '@/components/studio';

export const metadata = { title: 'Studio', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function StudioPage() {
  if (!(await isAdmin())) return <Studio authenticated={false} drafts={[]} stats={null} statsConfigured={false} totals={{ published: 0, drafts: 0 }} config={{ openai: false, blob: false, youtube: false }} />;
  const posts = await getAllPosts();
  const drafts: DraftItem[] = posts.filter((post) => post.status === 'draft').map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    content: post.format === 'text' ? post.content : htmlToText(post.content),
    categories: post.categories.map((category) => category.name),
    image: post.image ? imageSources(post).src : '',
    instagram: post.instagram ?? '',
    seoDescription: post.seoDescription ?? '',
    gallery: post.gallery ?? [],
    legacy: post.format !== 'text',
  }));
  const stats = await getStats().catch(() => null);
  return (
    <Studio
      authenticated
      drafts={drafts}
      stats={stats}
      statsConfigured={statsConfigured()}
      totals={{ published: posts.length - drafts.length, drafts: drafts.length }}
      config={{ openai: Boolean(process.env.OPENAI_API_KEY), blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN), youtube: Boolean(process.env.YOUTUBE_CHANNEL_ID) }}
    />
  );
}
