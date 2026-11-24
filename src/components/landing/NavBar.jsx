'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Menu, Repeat2, X } from 'lucide-react';
import { PATH_LABEL, PATH_NAV, setPath } from '@/lib/paths';
import usePath from '@/components/landing/usePath';
import { SITE_DOWNLOAD_URL, SITE_LOGO } from '@/lib/site';

// The first links show in the bar; the rest go under "More" so the bar never wraps.
const INLINE_COUNT = 4;

const LINKS = [
  { href: '/book', label: 'Book a cafe' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/#tournaments', label: 'Tournaments' },
  { href: '/#for-cafes', label: 'For cafes' },
  { href: '/blog', label: 'News' },
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/gaming-cafe-software', label: 'Cafe software' },
  { href: '/gaming-cafe-cost-calculator', label: 'Cost calculator' },
  { href: '/#faq', label: 'FAQ' },
];

function MoreMenu({ links }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  return (
    <li className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="font-tech flex items-center gap-1 whitespace-nowrap text-[11px] uppercase leading-none tracking-[0.2em] text-white/75 transition hover:text-white"
      >
        More <ChevronDown size={14} aria-hidden="true" className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="absolute right-0 top-full mt-4 min-w-[220px] rounded-2xl border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur-md">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                data-track="nav_click"
                data-track-label={l.label}
                className="font-tech block whitespace-nowrap rounded-xl px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** Site-wide header. `actions` adds controls before Download (the booking/marketplace pages add cart and account). */
export default function NavBar({ actions = null }) {
  const path = usePath();
  // On the home page the links follow the chosen audience; elsewhere they point back home.
  const links = path ? PATH_NAV[path] : LINKS;
  const inline = links.length > INLINE_COUNT + 1 ? links.slice(0, INLINE_COUNT) : links;
  const more = links.length > INLINE_COUNT + 1 ? links.slice(INLINE_COUNT) : [];
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
      <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-4 sm:h-20 sm:px-8" aria-label="Main">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Hash For Gamers home">
          <Image src={SITE_LOGO} alt="" width={48} height={48} priority className="h-10 w-10 sm:h-12 sm:w-12" />
          <span className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">Hash</span>
        </Link>

        <ul className="hidden min-w-0 items-center gap-7 xl:flex 2xl:gap-10">
          {inline.map((l) => (
            <li key={l.href}>
              <a href={l.href} data-track="nav_click" data-track-label={l.label} className="font-tech flex items-center whitespace-nowrap text-[11px] uppercase leading-none tracking-[0.2em] text-white/75 transition hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
          {more.length > 0 && <MoreMenu links={more} />}
        </ul>

        <div className={`flex shrink-0 items-center ${actions ? 'gap-0.5 sm:gap-2' : 'gap-2'}`}>
          {actions}
          {path && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPath(null);
              }}
              data-track="path_switch_click"
              data-track-from={path}
              className="font-tech hidden items-center gap-1.5 rounded-full border border-white/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white hover:text-white sm:inline-flex"
              aria-label={`Switch path (currently ${PATH_LABEL[path]})`}
            >
              <Repeat2 size={14} aria-hidden="true" /> {PATH_LABEL[path]}
            </button>
          )}
          <a
            href={SITE_DOWNLOAD_URL}
            data-track="app_download_click"
            data-track-store="onelink"
            data-track-placement="nav"
            className={`whitespace-nowrap rounded-full bg-white font-display uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white ${
              actions ? 'px-3.5 py-1.5 text-base sm:px-5 sm:py-2 sm:text-lg' : 'px-5 py-2 text-lg'
            }`}
          >
            Download
          </a>
          <button
            type="button"
            className="p-2 text-white xl:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="flex max-h-[calc(100vh-5rem)] flex-col gap-1 overflow-y-auto border-t border-white/10 px-4 pb-6 pt-2 xl:hidden">
          {path && (
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setPath(null);
                }}
                className="flex w-full items-center gap-2 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#ff9a3d]"
              >
                <Repeat2 size={16} aria-hidden="true" /> Switch path · now {PATH_LABEL[path]}
              </button>
            </li>
          )}
          {links.map((l) => (
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
