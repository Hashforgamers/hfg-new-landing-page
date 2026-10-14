'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SITE_DOWNLOAD_URL, SITE_LOGO } from '@/lib/site';

// Phone-only download prompt that appears once the hero's store buttons have scrolled away.
export default function MobileDownloadBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-full border border-white/15 bg-black/85 py-2 pl-2 pr-2 backdrop-blur-md transition-all duration-500 sm:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-2">
        <Image src={SITE_LOGO} alt="" width={36} height={36} className="rounded-full" />
        <div className="leading-tight">
          <p className="font-display text-lg uppercase text-white">Hash</p>
          <p className="font-tech whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-white/60">Free app</p>
        </div>
      </div>
      <a
        href={SITE_DOWNLOAD_URL}
        data-track="app_download_click"
        data-track-store="onelink"
        data-track-placement="mobile_bar"
        tabIndex={visible ? 0 : -1}
        className="whitespace-nowrap rounded-full bg-[#ff3d8b] px-5 py-2.5 font-display text-lg uppercase tracking-wide text-white"
      >
        Get the app
      </a>
    </div>
  );
}
