'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

const SOUND_SRC = '/audio/select.mp3';

// One shared, preloaded clip so rapid hovers restart it instead of stacking players.
// Browsers only allow audio after the visitor has interacted with the page (click, tap, key),
// so the very first hover before any interaction is silent; every hover after that plays.
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
      // Ignore: sound is decoration.
    }
  };
}

function JourneyCard({ card, index, onEnter }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [12, -12]), { stiffness: 220, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-14, 14]), { stiffness: 220, damping: 18 });
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

  return (
    <motion.a
      href={card.href}
      data-track="journey_card_click"
      data-track-journey={card.id}
      onPointerEnter={onEnter}
      onFocus={onEnter}
      onPointerMove={reduce ? undefined : move}
      onPointerLeave={reduce ? undefined : leave}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -10, scale: 1.03 }}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      className="group relative block min-h-[360px] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.5)] outline-none transition-shadow duration-300 hover:shadow-[0_30px_90px_rgba(255,61,139,0.35)] focus-visible:ring-2 focus-visible:ring-white sm:min-h-[420px]"
    >
      <Image
        src={card.image}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover opacity-60 transition duration-700 group-hover:scale-110 group-hover:opacity-80"
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${card.tint} via-black/60 to-black/10`} />
      {/* Light sweep that follows the pointer */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glare }}
      />
      <div className="relative flex h-full min-h-[360px] flex-col justify-between p-6 sm:min-h-[420px] sm:p-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
          {String(index + 1).padStart(2, '0')} · {card.kicker}
        </span>
        <div>
          <h3 className="font-display text-5xl uppercase leading-[0.9] text-white sm:text-6xl">{card.title}</h3>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/80">{card.body}</p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-lg uppercase tracking-wide text-black transition group-hover:bg-[#ff3d8b] group-hover:text-white">
            {card.cta} <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </motion.a>
  );
}

export default function JourneyCards({ cards }) {
  const play = useSelectSound();
  return (
    <section className="bg-black px-4 py-16 sm:px-8 sm:py-20" aria-labelledby="journey-title">
      <div className="mx-auto max-w-[1600px]">
        <h2 id="journey-title" className="mb-8 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#ff9a3d]">
          Choose your path
        </h2>
        <div className="grid gap-5 md:grid-cols-3" style={{ perspective: 1200 }}>
          {cards.map((c, i) => (
            <JourneyCard key={c.id} card={c} index={i} onEnter={play} />
          ))}
        </div>
      </div>
    </section>
  );
}
