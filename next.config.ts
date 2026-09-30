import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'czekaswiat.pl', pathname: '/**' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
    ],
  },
  async redirects() {
    const regions = ['azja', 'afryka', 'europa', 'ameryka-polnocna', 'ameryka-poludniowa', 'australia-i-oceania', 'australia'];
    return [
      // Adresy z poprzedniej wersji tego repozytorium
      { source: '/wpis/:slug', destination: '/:slug', permanent: true },
      { source: '/strona/:slug', destination: '/:slug', permanent: true },
      // Adresy ze starego WordPressa (czekaswiat.pl)
      { source: '/category/:parent/:slug', destination: '/kategoria/:slug', permanent: true },
      { source: '/category/:slug', destination: '/kategoria/:slug', permanent: true },
      { source: '/nasze-podroze', destination: '/mapa', permanent: true },
      { source: '/vlog', destination: '/kategoria/filmy', permanent: true },
      { source: '/portfolio-fotki', destination: '/kategoria/fotki', permanent: true },
      { source: '/spotkania', destination: '/', permanent: true },
      ...regions.map((region) => ({ source: `/${region}`, destination: `/kategoria/${region}`, permanent: true })),
    ];
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
      ],
    }];
  },
};

export default nextConfig;