export type Category = { name: string; slug: string };

export type PostStatus = 'draft' | 'published';

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  date: string;
  modified?: string;
  author: string;
  excerpt: string;
  content: string;
  /** `html` = zaimportowane z WordPressa, `text` = tworzone w studiu (akapity + `## nagłówki`). */
  format?: 'html' | 'text';
  status?: PostStatus;
  image: string;
  imageAlt: string;
  categories: Category[];
  tags: Category[];
  gallery?: string[];
  seoTitle?: string;
  seoDescription?: string;
  instagram?: string;
  youtubeId?: string;
};

export type PostPreview = Pick<BlogPost, 'id' | 'slug' | 'title' | 'date' | 'author' | 'excerpt' | 'image' | 'imageAlt' | 'categories'> & { imageFallback?: string };
