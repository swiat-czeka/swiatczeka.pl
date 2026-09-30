import type { BlogPost } from '@/lib/types';

const MEDIA_HOST = 'https://czekaswiat.pl';

export function plainText(html: string) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Stare adresy swiatczeka.pl/wp-content/... wskazują na nieistniejący już hosting; pliki leżą na czekaswiat.pl. */
export function normalizeMediaHost(url: string) {
  return url.replace(/^https?:\/\/(?:www\.)?swiatczeka\.pl\/wp-content\//i, `${MEDIA_HOST}/wp-content/`);
}

export function imageSources(post: Pick<BlogPost, 'image'>) {
  return { src: normalizeMediaHost(post.image), fallback: undefined as string | undefined };
}

/** Wpis bez tekstu (same zdjęcia albo sam link do albumu) uznajemy za niedokończony. Wyjątek: osadzony film. */
export function isIncomplete(post: BlogPost) {
  if (post.status) return post.status === 'draft';
  if (post.format === 'text') return false;
  if (/<iframe\s/i.test(post.content)) return false;
  return plainText(post.content).length < 40;
}

export function metaDescription(post: BlogPost) {
  if (post.seoDescription) return post.seoDescription;
  const source = plainText(post.format === 'text' ? post.content.replace(/^#{1,6}\s+/gm, '') : post.content);
  const text = plainText(post.excerpt || '').length >= 70 ? plainText(post.excerpt) : source;
  if (text.length <= 158) return text;
  const cut = text.slice(0, 158);
  const boundary = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return `${boundary > 90 ? cut.slice(0, boundary + 1) : cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '')}…`;
}

export function metaTitle(post: BlogPost) {
  return (post.seoTitle || post.title).replace(/\s*\.{2,}\s*$/, '').replace(/\s+/g, ' ').trim();
}

/** Stara treść HTML: poprawia host mediów, leniwe ładowanie i prywatniejsze osadzanie YouTube. */
export function rewriteLegacyHtml(html: string) {
  const widths = [640, 828, 1080, 1200]; // muszą należeć do images.deviceSizes w Next
  const optimized = (src: string, width: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=80`;
  return html
    .replace(/<img\b([^>]*?)\bsrc="([^"]+)"([^>]*)>/gi, (_m, before: string, rawSrc: string, after: string) => {
      const src = normalizeMediaHost(rawSrc);
      const rest = `${before}${after}`.replace(/\s+(?:srcset|sizes|decoding|loading)="[^"]*"/gi, '').replace(/\s*\/\s*$/, '');
      if (!src.startsWith(`${MEDIA_HOST}/wp-content/`)) return `<img${rest} src="${src}" loading="lazy" decoding="async">`;
      const srcset = widths.map((w) => `${optimized(src, w)} ${w}w`).join(', ');
      return `<img${rest} src="${optimized(src, 1080)}" srcset="${srcset}" sizes="(max-width: 900px) 92vw, 780px" loading="lazy" decoding="async">`;
    })
    .replace(/<a\b([^>]*?)\bhref="(https?:\/\/(?:www\.)?swiatczeka\.pl\/wp-content\/[^"]+)"/gi, (_m, before: string, href: string) => `<a${before} href="${normalizeMediaHost(href)}"`)
    .replace(/<iframe\b([^>]*?)\bsrc="https?:\/\/www\.youtube\.com\/embed\//gi, '<iframe$1 src="https://www.youtube-nocookie.com/embed/')
    .replace(/<iframe\b/gi, '<iframe loading="lazy"');
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
    .replace(/-$/, '');
}

/** HTML ze starego WordPressa → zwykły tekst z akapitami (do dokańczania w studiu). */
export function htmlToText(html: string) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n\n## $1\n\n')
    .replace(/<\/(p|div|li|figure)>|<br\s*\/?>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Adresy zajęte przez aplikację i stare podstrony. Wpis o takim adresie dostaje przyrostek. */
export const RESERVED_SLUGS = new Set(['studio', 'mapa', 'api', 'kategoria', 'category', 'strona', 'wpis', 'sitemap', 'robots', 'klub', 'dokad-dalej', 'cookie-policy', 'nasze-podroze', 'vlog', 'portfolio-fotki', 'spotkania', 'azja', 'afryka', 'europa', 'australia', 'ameryka-polnocna', 'ameryka-poludniowa', 'australia-i-oceania', 'feed', 'tag', 'author', 'login']);
