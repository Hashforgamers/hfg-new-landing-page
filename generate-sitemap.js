// generate-sitemap.js (ES Module syntax)

import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve } from 'path';

const links = [
  { url: '/', changefreq: 'monthly', priority: 1.0 },
  { url: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms', changefreq: 'yearly', priority: 0.3 },
  { url: '/list-your-cafe', changefreq: 'monthly', priority: 0.7 },
  { url: '/view-locations', changefreq: 'monthly', priority: 0.7 },
  { url: '/waitlist', changefreq: 'monthly', priority: 0.6 },
  { url: '/about', changefreq: 'yearly', priority: 0.4 },
  { url: '/join-community', changefreq: 'monthly', priority: 0.6 },
  { url: '/what-is-hash', changefreq: 'yearly', priority: 0.5 },
  { url: '/cafe-pricing', changefreq: 'monthly', priority: 0.6 },
  { url: '/how-it-works', changefreq: 'yearly', priority: 0.4 },
  // Add more if your routing supports them as standalone pages
];

(async () => {
  const sitemap = new SitemapStream({ hostname: 'https://hashforgamers.co.in' });
  const writeStream = createWriteStream(resolve(process.cwd(), 'public', 'sitemap.xml'));

  sitemap.pipe(writeStream);
  links.forEach(link => sitemap.write(link));
  sitemap.end();

  await streamToPromise(sitemap);
  console.log('✅ Sitemap generated at /public/sitemap.xml');
})();
