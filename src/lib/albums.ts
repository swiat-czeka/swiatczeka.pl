import albumData from '@/data/albums.json';
import googleAlbumData from '@/data/google-albums.json';

export type AlbumMedia = { src: string; video?: boolean; href?: string };
export type Album = { slug: string; title: string; date: string; cover: string; photos: string[]; media?: AlbumMedia[]; google?: string; source?: 'google' };

// Albumy bez zdjęć i bez linku do Google Photos nie mają czego pokazać.
const albums = ([...(googleAlbumData as Album[]), ...(albumData as Album[])])
  .filter((album) => album.photos.length > 0 || album.google)
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

export const getAlbums = () => albums;
export const getAlbum = (slug: string) => albums.find((album) => album.slug === slug);
