'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { CalendarCheck, ShoppingBag } from 'lucide-react';
import { track } from '@/lib/analytics';
import { PATH_EVENT, scrollToTop, setPath } from '@/lib/paths';
import { SITE_LOGO } from '@/lib/site';

const SOUND_SRC = '/audio/select.mp3';
const EXPAND_MS = 750;

// One shared, preloaded clip so rapid hovers restart it instead of stacking players.
// Browsers only allow audio after the visitor has interacted with the page (click, tap, key),
// so the very first hover on a fresh page is silent; every hover after that plays.
function useSelectSound() {
  const audio = useRef(null);
  useEffect(() => {
    const a = new Audio(SOUND_SRC);
    a.preload = 'auto';
    a.volume = 0.45;
    audio.current = a;
    return () => {
      a.pause();
      audio.current = null;
    };
  }, []);
  return () => {
    const a = audio.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {
      // Sound is decoration.
    }
  };
}

function PathCard({ card, index, onEnter, onSelect, leaving }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const glareX = useTransform(mx, [0, 1], ['0%', '100%']);
  const glareY = useTransform(my, [0, 1], ['0%', '100%']);
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.22), transparent 55%)`
  );

  const move = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const leave = () => {
    mx.set(0.5);
    my.set(0.5);
  };
  const isChosen = leaving === card.id;

  return (
    <motion.button
      type="button"
      onClick={(e) => onSelect(card, e.currentTarget.getBoundingClientRect())}
      onPointerEnter={onEnter}
      onFocus={onEnter}
      onPointerMove={reduce ? undefined : move}
      onPointerLeave={reduce ? undefined : leave}
      initial={reduce ? false : { opacity: 0, y: 60, rotateX: 25 }}
      animate={
        leaving
          ? isChosen
            ? { scale: 1.06, opacity: 1 }
            : { opacity: 0, y: 80, scale: 0.9 }
          : { opacity: 1, y: 0, rotateX: 0 }
      }
      transition={{ duration: leaving ? 0.45 : 0.8, delay: leaving ? 0 : 0.25 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce || leaving ? undefined : { y: -4 }}
      style={reduce ? undefined : { transformPerspective: 900 }}
      className="group relative block min-h-[150px] w-full overflow-hidden rounded-2xl border border-white/15 bg-black text-left shadow-[0_20px_60px_rgba(0,0,0,0.5)] outline-none transition-shadow duration-300 hover:shadow-[0_30px_90px_rgba(255,61,139,0.35)] focus-visible:ring-2 focus-visible:ring-white md:h-full md:min-h-[260px]"
    >
      <Image
        src={card.image}
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover opacity-55 transition duration-700 group-hover:scale-110 group-hover:opacity-80"
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${card.tint} via-black/60 to-black/10`} />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glare }}
      />
      <div className="relative flex h-full min-h-[150px] flex-col justify-between p-5 md:min-h-0 md:p-7">
        <span className="font-tech whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 md:text-[11px]">
          {String(index + 1).padStart(2, '0')} · {card.kicker}
        </span>
        <div>
          <h2 className="font-display uppercase leading-[0.9] text-white">
            <span className="block text-2xl text-white/80 md:text-[clamp(1.25rem,2vw,1.9rem)]">{card.title}</span>{" "}
            <span
              className="shine-text block text-[2.6rem] transition-[filter] duration-300 group-hover:brightness-125 md:text-[clamp(2.2rem,4.6vw,4.6rem)]"
              style={{ '--shine-a': card.shine[0], '--shine-b': card.shine[1], animationDelay: `${index * 0.6}s` }}
            >
              {card.highlight}
            </span>
          </h2>
          <p className="mt-2 hidden max-w-xs text-sm leading-6 text-white/80 md:block">{card.body}</p>
          <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-display text-base uppercase tracking-wide text-black transition group-hover:bg-[#ff3d8b] group-hover:text-white md:mt-5 md:px-5 md:py-2.5 md:text-lg">
            {card.cta} <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </motion.button>
  );
}

// Full-screen "Choose your path" entry. Visible until a path is picked (CSS hides it once
// html[data-path] is set); the Switch button in the nav clears the path and brings it back.
export default function PathGate({ cards }) {
  const reduce = useReducedMotion();
  const play = useSelectSound();
  const [leaving, setLeaving] = useState(null);
  const [curtain, setCurtain] = useState(null); // { tint, x, y }
  const [round, setRound] = useState(0);

  useEffect(() => {
    // The boot script skipped the gate (came from /book, /marketplace, or a returning player).
    const reason = document.documentElement.dataset.pathReason;
    if (reason) track('journey_auto', { journey: document.documentElement.dataset.path, reason });
    else if (!document.documentElement.dataset.path) track('journey_gate_shown', {});
  }, []);

  useEffect(() => {
    const on = (e) => {
      if (e.detail == null) {
        setLeaving(null);
        setRound((r) => r + 1);
        scrollToTop();
      }
    };
    window.addEventListener(PATH_EVENT, on);
    return () => window.removeEventListener(PATH_EVENT, on);
  }, []);

  const select = (card, rect) => {
    if (leaving) return;
    track('journey_card_click', { journey: card.id });
    if (reduce) {
      setPath(card.id);
      scrollToTop();
      return;
    }
    setLeaving(card.id);
    setCurtain({ tint: card.curtain, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setTimeout(() => {
      setPath(card.id);
      scrollToTop();
      setTimeout(() => setCurtain(null), 60);
    }, EXPAND_MS);
  };

  return (
    <>
      <div
        id="path-gate"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="path-gate-title"
        className="fixed inset-0 z-[70] overflow-y-auto bg-black"
      >
        <div
          className="pointer-events-none fixed -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#ff3d8b]/25 blur-[150px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none fixed -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#7c3aed]/25 blur-[150px]"
          aria-hidden="true"
        />
        <div key={round} className="relative mx-auto flex min-h-full max-w-[1500px] flex-col px-4 py-8 sm:px-8 md:justify-center md:py-6">
          <motion.header
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4"
            initial={reduce ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: leaving ? 0 : 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <Image src={SITE_LOGO} alt="" width={40} height={40} priority className="h-9 w-9" />
              <span className="font-display text-2xl uppercase tracking-wide text-white">Hash</span>
            </div>
            <nav aria-label="Skip to" className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <span className="mr-1 hidden text-sm text-white/55 lg:inline">Just here to play?</span>
              {[
                ['/book', 'Book a gaming cafe', 'Book a cafe', 'book_click', CalendarCheck, 'border-[#ff3d8b]/35 bg-[#ff3d8b]/[0.12] hover:border-[#ff3d8b]/70 hover:bg-[#ff3d8b]/20', 'text-[#ff7bb0]'],
                ['/marketplace', 'Shop gaming gear', 'Shop gear', 'shop_click', ShoppingBag, 'border-[#ff9a3d]/35 bg-[#ff9a3d]/[0.12] hover:border-[#ff9a3d]/70 hover:bg-[#ff9a3d]/20', 'text-[#ffb36b]'],
              ].map(([href, label, short, event, Icon, tone, iconTone]) => (
                <a
                  key={href}
                  href={href}
                  data-track={event}
                  data-track-placement="path_gate"
                  onClick={() => {
                    // They're a player: home shows the gamer view next time.
                    try {
                      sessionStorage.setItem('hash-path', 'gamer');
                    } catch {}
                  }}
                  className={`group inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 sm:px-4 text-sm font-medium text-white backdrop-blur-sm transition sm:flex-none ${tone}`}
                >
                  <Icon className={`h-4 w-4 ${iconTone}`} aria-hidden="true" />
                  <span className="sm:hidden">{short}</span>
                  <span className="hidden sm:inline">{label}</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </a>
              ))}
            </nav>
          </motion.header>
          <motion.p
            id="path-gate-title"
            className="mt-8 font-display text-[clamp(3rem,min(9vw,12svh),8rem)] uppercase leading-[0.85] text-white md:mt-5"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: leaving ? 0 : 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Choose your <span className="bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] bg-clip-text text-transparent">path</span>
          </motion.p>
          <motion.p
            className="mt-3 max-w-xl text-sm leading-6 text-white/65 md:text-base"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: leaving ? 0 : 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Tell us who you are and we&apos;ll show you what Hash does for you. You can switch any time.
          </motion.p>
          <div className="mt-8 grid gap-3 md:mt-5 md:max-h-[480px] md:min-h-[276px] md:flex-1 md:grid-cols-3 md:grid-rows-[minmax(0,1fr)] md:gap-5 md:p-2" style={{ perspective: 1200 }}>
            {cards.map((c, i) => (
              <PathCard key={c.id} card={c} index={i} onEnter={play} onSelect={select} leaving={leaving} />
            ))}
          </div>
        </div>
      </div>

      {/* Colour wipe that grows out of the chosen card, then fades to reveal the page */}
      <AnimatePresence>
        {curtain && (
          <motion.div
            key="curtain"
            aria-hidden="true"
            className={`pointer-events-none fixed inset-0 z-[80] bg-gradient-to-br ${curtain.tint}`}
            initial={{ clipPath: `circle(0px at ${curtain.x}px ${curtain.y}px)` }}
            animate={{ clipPath: `circle(150vmax at ${curtain.x}px ${curtain.y}px)` }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
            transition={{ duration: EXPAND_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
