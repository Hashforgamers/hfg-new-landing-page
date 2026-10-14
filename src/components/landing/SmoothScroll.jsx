'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

// Weighted smooth scrolling for the landing page. Native scroll position still updates,
// so framer-motion's useScroll parallax keeps working. Off for reduced-motion users.
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, anchors: { offset: -80 } });
    // Exposed so path switches (src/lib/paths.js) can jump to the top without Lenis easing back.
    window.__lenis = lenis;
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    // AppShell locks scrolling with body overflow:hidden while a modal is open; mirror that here.
    const lock = new MutationObserver(() => {
      if (document.body.style.overflow === 'hidden') lenis.stop();
      else lenis.start();
    });
    lock.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    return () => {
      lock.disconnect();
      cancelAnimationFrame(frame);
      if (window.__lenis === lenis) delete window.__lenis;
      lenis.destroy();
    };
  }, []);

  return null;
}
