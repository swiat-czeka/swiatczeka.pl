export type Category = { name: string; slug: string };

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  date: string;
  modified?: string;
  author: string;
  excerpt: string;
  content: string;
  image: string;
  imageAlt: string;
  categories: Category[];
  tags: Category[];
  gallery?: string[];
};

export type PostPreview = Pick<BlogPost, 'id' | 'slug' | 'title' | 'date' | 'author' | 'excerpt' | 'image' | 'imageAlt' | 'categories'>;