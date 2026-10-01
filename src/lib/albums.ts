import albumData from '@/data/albums.json';

export type Album = { slug: string; title: string; date: string; cover: string; photos: string[]; google?: string };

// Albumy bez zdjęć i bez linku do Google Photos nie mają czego pokazać.
const albums = (albumData as Album[]).filter((album) => album.photos.length > 0 || album.google);

export const getAlbums = () => albums;
export const getAlbum = (slug: string) => albums.find((album) => album.slug === slug);
