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

/** WordPress zapisuje miniatury jako `nazwa-622x351.jpg` (czasem z doklejoną cyfrą). Oryginał to `nazwa.jpg`. */
export function originalImageUrl(url: string) {
  if (!url) return url;
  return normalizeMediaHost(url).replace(/-\d{2,4}x\d{2,5}(?=\.(?:jpe?g|png|webp|gif)(?:\?|$))/i, '');
}

export function normalizeMediaHost(url: string) {
  return url.replace(/^https?:\/\/(?:www\.)?swiatczeka\.pl\/wp-content\//i, `${MEDIA_HOST}/wp-content/`);
}

export function imageSources(post: Pick<BlogPost, 'image'>) {
  const src = originalImageUrl(post.image);
  const fallback = normalizeMediaHost(post.image);
  return { src, fallback: fallback !== src ? fallback : undefined };
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

/** Podmienia adresy miniatur i hostów mediów w starej treści HTML, żeby zdjęcia były ostre i działały po zmianie domeny. */
export function rewriteLegacyHtml(html: string) {
  return html
    .replace(/<img\b([^>]*?)\bsrc="([^"]+)"([^>]*)>/gi, (_match, before: string, src: string, after: string) => {
      const original = originalImageUrl(src);
      const fallback = normalizeMediaHost(src);
      const onerror = original !== fallback ? ` data-fb="${fallback}" onerror="this.onerror=null;this.removeAttribute('srcset');this.src=this.dataset.fb"` : '';
      return `<img${before} src="${original}"${onerror}${after.replace(/\bsrcset="[^"]*"/i, '')} decoding="async">`;
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
