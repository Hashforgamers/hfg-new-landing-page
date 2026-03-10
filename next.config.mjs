/** @type {import('next').NextConfig} */
const nextConfig = {
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
