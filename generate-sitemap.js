// generate-sitemap.js (ES Module syntax)

import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve } from 'path';

const links = [
  { url: '/', changefreq: 'monthly', priority: 1.0 },
  { url: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
  // Add more URLs here
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
