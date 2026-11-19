// One place to send events to Firebase Analytics (GA4) and the Meta Pixel.
// Intent signals stay custom; only confirmed outcomes should use recommended conversion events.
import { FIREBASE_CONFIG } from '@/lib/site';

let firebase = null; // Promise<{ analytics, logEvent }> once started
const queue = [];

// Starts Firebase Analytics in the browser. Firebase loads gtag itself, so the manual
// gtag script in Analytics.jsx is only used when no Firebase config is set.
export function initFirebaseAnalytics() {
  if (typeof window === 'undefined' || !FIREBASE_CONFIG || firebase) return firebase;
  firebase = (async () => {
    const [{ initializeApp, getApps }, fa] = await Promise.all([import('firebase/app'), import('firebase/analytics')]);
    if (!(await fa.isSupported())) return null;
    const app = getApps()[0] || initializeApp(FIREBASE_CONFIG);
    // Page views are sent by Analytics.jsx on every route change.
    const analytics = fa.initializeAnalytics(app, { config: { send_page_view: false } });
    queue.splice(0).forEach(([name, params]) => fa.logEvent(analytics, name, params));
    return { analytics, logEvent: fa.logEvent };
  })().catch(() => null);
  return firebase;
}

function sendGa(name, params) {
  if (!FIREBASE_CONFIG) return window.gtag?.('event', name, params);
  if (!firebase) return queue.push([name, params]);
  firebase.then((fb) => fb?.logEvent(fb.analytics, name, params));
}

export function track(name, params = {}) {
  if (typeof window === 'undefined') return;
  try {
    sendGa(name, params);
    // Page views map to Meta's standard event; everything else stays custom so
    // Meta/GA conversion reporting does not inflate actual customer conversions.
    if (name === 'page_view') window.fbq?.('track', 'PageView');
    else window.fbq?.('trackCustom', name, params);
  } catch {
    // Analytics must never break the page.
  }
}

// Reads data-track="event_name" plus any data-track-<param>="value" attributes.
export function trackFromElement(el) {
  const name = el?.dataset?.track;
  if (!name) return;
  const params = {};
  for (const [key, value] of Object.entries(el.dataset)) {
    if (key.startsWith('track') && key !== 'track') {
      const param = key.slice(5).replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`).replace(/^_/, '');
      params[param] = value;
    }
  }
  track(name, params);
}
