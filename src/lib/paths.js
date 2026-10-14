// Audience "paths" on the home page. The entry screen asks visitors to pick one, then the page
// shows only the sections tagged for that audience (see data-audience in src/app/page.js and the
// html[data-path] rules in globals.css).

export const PATH_IDS = ['gamer', 'cafe', 'franchise'];
export const PATH_STORAGE_KEY = 'hash-path';
export const PATH_EVENT = 'hash:path';

export const PATH_NAV = {
  gamer: [
    { href: '#tournaments', label: 'Tournaments' },
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#marketplace', label: 'Marketplace' },
    { href: '/blog', label: 'News' },
    { href: '#faq', label: 'FAQ' },
  ],
  cafe: [
    { href: '#for-cafes', label: 'Dashboard' },
    { href: '#kiosk', label: 'Kiosk' },
    { href: '/gaming-cafe-cost-calculator', label: 'Cost calculator' },
    { href: '#fill-every-seat', label: 'Get started' },
    { href: '#faq', label: 'FAQ' },
  ],
  franchise: [
    { href: '#franchise', label: 'Franchise' },
    { href: '#kiosk', label: 'Kiosk' },
    { href: '/gaming-cafe-cost-calculator', label: 'Cost calculator' },
    { href: '#faq', label: 'FAQ' },
  ],
};

export const PATH_LABEL = { gamer: 'Gamer', cafe: 'Cafe owner', franchise: 'Franchise' };

// Arriving on /#<section> (e.g. from another page's nav) picks the matching path and skips the gate.
export const HASH_TO_PATH = {
  tournaments: 'gamer',
  features: 'gamer',
  'how-it-works': 'gamer',
  marketplace: 'gamer',
  faq: 'gamer',
  'for-cafes': 'cafe',
  kiosk: 'cafe',
  'fill-every-seat': 'cafe',
  franchise: 'franchise',
};

// Runs inline before the page paints, so a known path never flashes the entry screen.
export const PATH_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;d.classList.add('has-gate');var ids=${JSON.stringify(
  PATH_IDS
)};var map=${JSON.stringify(HASH_TO_PATH)};var q=new URLSearchParams(location.search).get('for');var h=location.hash.slice(1);var p=ids.indexOf(q)>-1?q:map[h]||sessionStorage.getItem('${PATH_STORAGE_KEY}');if(ids.indexOf(p)>-1)d.dataset.path=p;}catch(e){}})();`;

export function getPath() {
  if (typeof document === 'undefined') return null;
  return document.documentElement.dataset.path || null;
}

export function scrollToTop() {
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

export function setPath(path) {
  const d = document.documentElement;
  try {
    if (path) {
      d.dataset.path = path;
      sessionStorage.setItem(PATH_STORAGE_KEY, path);
    } else {
      delete d.dataset.path;
      sessionStorage.removeItem(PATH_STORAGE_KEY);
    }
    const url = new URL(window.location.href);
    if (path) url.searchParams.set('for', path);
    else url.searchParams.delete('for');
    url.hash = '';
    window.history.replaceState(null, '', url);
  } catch {
    // Storage or history can be unavailable; the attribute alone still drives the page.
  }
  window.dispatchEvent(new CustomEvent(PATH_EVENT, { detail: path }));
  // Sections that were display:none measured as zero height; make scroll-linked animations
  // (parallax, hero fade) re-measure now that they are visible.
  requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
}
