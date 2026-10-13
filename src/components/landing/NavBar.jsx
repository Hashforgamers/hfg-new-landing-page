'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { SITE_DOWNLOAD_URL, SITE_LOGO } from '@/lib/site';

const LINKS = [
  { href: '#tournaments', label: 'Tournaments' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#marketplace', label: 'Marketplace' },
  { href: '#for-cafes', label: 'For cafes' },
  { href: '#faq', label: 'FAQ' },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? 'bg-black/85 backdrop-blur-md' : 'bg-gradient-to-b from-black/70 to-transparent'
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <nav className="mx-auto flex h-20 max-w-[1600px] sm:h-28 items-center justify-between px-4 sm:px-8" aria-label="Main">
        <Link href="/" className="flex items-center gap-2" aria-label="Hash For Gamers home">
          <Image src={SITE_LOGO} alt="" width={96} height={96} priority className="h-16 w-16 sm:h-24 sm:w-24" />
          <span className="font-display text-4xl uppercase tracking-wide text-white sm:text-5xl">Hash</span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-xs font-semibold uppercase tracking-[0.25em] text-white/75 transition hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={SITE_DOWNLOAD_URL}
            className="rounded-full bg-white px-5 py-2 font-display text-lg uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white"
          >
            Download
          </a>
          <button
            type="button"
            className="p-2 text-white lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="flex flex-col gap-1 border-t border-white/10 px-4 pb-6 pt-2 lg:hidden">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-3 font-display text-3xl uppercase text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
