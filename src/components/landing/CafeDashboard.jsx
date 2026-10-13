'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const ROTATE_MS = 5000;

// Tabbed tour of the cafe dashboard inside a browser-style frame. Auto-advances until the
// visitor picks a tab themselves.
export default function CafeDashboard({ screens }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!auto || reduce) return;
    const t = setInterval(() => setActive((i) => (i + 1) % screens.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [auto, reduce, screens.length]);

  const screen = screens[active];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:items-center">
      <div role="tablist" aria-label="Dashboard features" className="flex flex-col">
        {screens.map((s, i) => {
          const selected = i === active;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="cafe-dashboard-panel"
              onClick={() => {
                setActive(i);
                setAuto(false);
              }}
              className={`group relative border-t border-white/15 py-5 pl-5 text-left transition-colors last:border-b ${
                selected ? 'text-white' : 'text-white/45 hover:text-white/80'
              }`}
            >
              <span
                className={`absolute left-0 top-0 h-full w-[3px] origin-top bg-gradient-to-b from-[#ff3d8b] to-[#ff9a3d] transition-transform duration-500 ${
                  selected ? 'scale-y-100' : 'scale-y-0'
                }`}
                aria-hidden="true"
              />
              <span className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ff9a3d]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="mt-1 block font-display text-3xl uppercase leading-none sm:text-4xl">{s.title}</span>
              <span
                className={`grid transition-all duration-500 ${
                  selected ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <span className="overflow-hidden text-sm leading-6 text-white/75">{s.body}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="cafe-dashboard-panel"
        role="tabpanel"
        className="relative overflow-hidden rounded-xl border border-white/15 bg-[#0b0b0f] shadow-[0_40px_120px_rgba(255,61,139,0.25)]"
      >
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 truncate rounded-full bg-black/40 px-4 py-1 text-[11px] text-white/50">
            dashboard.hashforgamers.com
          </span>
        </div>
        <div className="relative aspect-[4/3] sm:aspect-[1470/780]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={screen.id}
              className="absolute inset-0"
              initial={reduce ? false : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={screen.image}
                alt={screen.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-left-top"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
