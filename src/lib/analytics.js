// One place to send events to Google Analytics 4 and the Meta Pixel.
// Event names are GA4-style snake_case; the Meta Pixel gets the matching standard event
// where one exists (so ads can optimise for it) and a custom event otherwise.

const META_STANDARD = {
  app_download_click: 'Lead',
  cafe_onboard_click: 'Lead',
  franchise_enquiry_click: 'Contact',
  calculator_cta_click: 'Lead',
};

export function track(name, params = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', name, params);
    const standard = META_STANDARD[name];
    if (standard) window.fbq?.('track', standard, { content_name: name, ...params });
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
