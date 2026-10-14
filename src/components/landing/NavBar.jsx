'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Repeat2, X } from 'lucide-react';
import { PATH_LABEL, PATH_NAV, setPath } from '@/lib/paths';
import usePath from '@/components/landing/usePath';
import { SITE_DOWNLOAD_URL, SITE_LOGO } from '@/lib/site';

const LINKS = [
  { href: '/#tournaments', label: 'Tournaments' },
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#marketplace', label: 'Marketplace' },
  { href: '/#for-cafes', label: 'For cafes' },
  { href: '/gaming-cafe-cost-calculator', label: 'Cost calculator' },
  { href: '/blog', label: 'News' },
  { href: '/#faq', label: 'FAQ' },
];

export default function NavBar() {
  const path = usePath();
  // On the home page the links follow the chosen audience; elsewhere they point back home.
  const links = path ? PATH_NAV[path] : LINKS;
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
      <nav className="mx-auto flex h-16 max-w-[1600px] sm:h-20 items-center justify-between px-4 sm:px-8" aria-label="Main">
        <Link href="/" className="flex items-center gap-2" aria-label="Hash For Gamers home">
          <Image src={SITE_LOGO} alt="" width={48} height={48} priority className="h-10 w-10 sm:h-12 sm:w-12" />
          <span className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">Hash</span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} data-track="nav_click" data-track-label={l.label} className="font-tech text-[11px] uppercase tracking-[0.2em] text-white/75 transition hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
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
