'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useReportWebVitals } from 'next/web-vitals';
import { initFirebaseAnalytics, setUserProps, track, trackFromElement } from '@/lib/analytics';
import { PATH_EVENT, getPath } from '@/lib/paths';
import { FIREBASE_CONFIG, GA_MEASUREMENT_ID, META_PIXEL_ID } from '@/lib/site';

const IS_PROD = process.env.NODE_ENV === 'production';
const SCROLL_MARKS = [25, 50, 75, 90];

// Loads Firebase Analytics (or plain GA4) and the Meta Pixel, sends page views on client-side
// navigation, and auto-tracks: data-track clicks, outbound/phone/email/WhatsApp links,
// scroll depth per page, and forms blocked by validation.
export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (IS_PROD) initFirebaseAnalytics();
    // Gamer vs cafe-owner path, so every report can be split by audience.
    const path = getPath();
    if (path) setUserProps({ visitor_type: path });
    const onPath = () => {
      const next = getPath();
      setUserProps({ visitor_type: next || 'none' });
      track('path_selected', { visitor_type: next || 'none' });
    };
    const onError = (e) => track('exception', { description: String(e.message || e.reason || 'unknown').slice(0, 150), fatal: false });
    window.addEventListener(PATH_EVENT, onPath);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onError);
    return () => {
      window.removeEventListener(PATH_EVENT, onPath);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onError);
    };
  }, []);

  // Core Web Vitals (LCP, CLS, INP, FCP, TTFB) per page, to spot slow pages.
  useReportWebVitals((m) => {
    track('web_vitals', { metric_name: m.name, value: Math.round(m.name === 'CLS' ? m.value * 1000 : m.value), rating: m.rating, page_path: window.location.pathname });
  });

  useEffect(() => {
    track('page_view', { page_path: pathname, page_location: window.location.href, page_title: document.title });

    const seen = new Set();
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = (window.scrollY / max) * 100;
      for (const mark of SCROLL_MARKS) {
        if (pct >= mark && !seen.has(mark)) {
          seen.add(mark);
          track('scroll_depth', { percent: mark, page_path: pathname });
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (!(e.target instanceof Element)) return;
      const tracked = e.target.closest('[data-track]');
      if (tracked) return trackFromElement(tracked);

      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      const text = (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 80);
      if (href.startsWith('tel:')) track('phone_click', { link_text: text });
      else if (href.startsWith('mailto:')) track('email_click', { link_text: text });
      else if (a.host && a.host !== window.location.host) {
        track('outbound_click', { link_domain: a.hostname, link_url: a.href, link_text: text });
      }
    };
    // Fires once per invalid field when a submit is blocked by browser validation.
    const onInvalid = (e) => {
      const field = e.target;
      track('form_validation_error', { form_name: field.form?.getAttribute('name') || field.form?.id || 'unknown', field_name: field.name });
    };
    document.addEventListener('click', onClick, { capture: true });
    document.addEventListener('invalid', onInvalid, { capture: true });
    return () => {
      document.removeEventListener('click', onClick, { capture: true });
      document.removeEventListener('invalid', onInvalid, { capture: true });
    };
  }, []);

  if (!IS_PROD) return null;

  return (
    <>
      {!FIREBASE_CONFIG && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{send_page_view:false});`}
          </Script>
        </>
      )}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: 'none' }} alt="" src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
      </noscript>
    </>
  );
}
