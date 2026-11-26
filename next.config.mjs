/** @type {import('next').NextConfig} */
const FIREBASE_AUTH_HOST = 'https://hash-ee6fc.firebaseapp.com';

const nextConfig = {
  async rewrites() {
    // Serve Firebase's sign-in helper pages from our own domain. Safari, Firefox
    // and newer Chrome block the cross-site storage that redirect sign-in needs
    // when the handler lives on firebaseapp.com, so on iPhones the redirect
    // fallback would silently come back signed out. With this proxy in place,
    // NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN can point at our own host.
    return [
      { source: '/__/auth/:path*', destination: `${FIREBASE_AUTH_HOST}/__/auth/:path*` },
      { source: '/__/firebase/:path*', destination: `${FIREBASE_AUTH_HOST}/__/firebase/:path*` },
    ];
  },
  async redirects() {
    // The "coming soon" shop page is now the live Hash Marketplace.
    return [{ source: '/shop', destination: '/marketplace', permanent: true }];
  },
  images: {
    localPatterns: [
      {
        pathname: '/images/hash-logo.png',
        search: '?v=20260311-0146',
      },
      {
        pathname: '/images/characters.png',
        search: '?v=20260311-0203',
      },
      {
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
