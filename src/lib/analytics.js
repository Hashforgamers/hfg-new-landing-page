// One place to send events to Google Analytics 4 and the Meta Pixel.
// Intent signals stay custom; only confirmed outcomes should use recommended conversion events.

export function track(name, params = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', name, params);
    // CTAs are intent signals, not completed leads or purchases. Keep them custom
    // so Meta/GA conversion reporting does not inflate actual customer conversions.
    window.fbq?.('trackCustom', name, params);
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
