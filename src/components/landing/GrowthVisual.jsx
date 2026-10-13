'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';

// Bar heights as a multiple of the starting month; the last bar is the 10x peak.
const BARS = [1, 1.6, 2.5, 3.8, 5.4, 7.4, 10];
const SEATS = 40;
const SEATS_BEFORE = 4;

// Eye-catching "1x to 10x" growth graphic: a counting multiplier, bars that grow in sequence
// under a rising curve, and a seat map that fills up. Plays once when scrolled into view.
export default function GrowthVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const reduce = useReducedMotion();
  const play = inView || reduce;
  const [count, setCount] = useState(reduce ? 10 : 1);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(1, 10, {
      duration: 2.2,
      delay: 0.3,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setCount(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/60 p-6 backdrop-blur-md sm:p-8"
      role="img"
      aria-label="Illustration of cafe bookings growing from 1x to 10x after listing on Hash, with seats filling up"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ff9a3d]">Bookings with Hash</p>
          <p className="mt-1 bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] bg-clip-text font-display text-[clamp(5rem,14vw,11rem)] leading-[0.85] text-transparent tabular-nums">
            {count}X
          </p>
        </div>
        <motion.p
          className="mb-3 rounded-full bg-[#16ff7a]/15 px-4 py-2 font-display text-xl uppercase tracking-wide text-[#16ff7a]"
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={play ? { opacity: 1, scale: 1 } : undefined}
          transition={{ delay: 2.3, type: 'spring', stiffness: 260, damping: 14 }}
        >
          ▲ Growth
        </motion.p>
      </div>

      <div className="relative mt-6 h-48 sm:h-56">
        <div className="absolute inset-0 flex items-end gap-2 sm:gap-3">
          {BARS.map((b, i) => {
            const peak = i === BARS.length - 1;
            return (
              <div key={i} className="relative flex h-full flex-1 items-end">
                <motion.div
                  className={`w-full origin-bottom rounded-t-md ${
                    peak
                      ? 'bg-gradient-to-t from-[#ff3d8b] to-[#ffd23d] shadow-[0_0_40px_rgba(255,154,61,0.6)]'
                      : 'bg-white/20'
                  }`}
                  style={{ height: `${b * 10}%` }}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={play ? { scaleY: 1 } : undefined}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.22, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            );
          })}
        </div>
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <motion.path
            d="M 7 90 L 21 84 L 36 75 L 50 62 L 64 46 L 79 26 L 93 1"
            fill="none"
            stroke="#fff"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={play ? { pathLength: 1 } : undefined}
            transition={{ duration: 2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
        <span>Before Hash</span>
        <span>On Hash</span>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">Your floor, filling up</p>
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: SEATS }, (_, i) => (
            <motion.span
              key={i}
              className="aspect-square rounded-[4px]"
              initial={reduce ? false : { backgroundColor: i < SEATS_BEFORE ? '#ff3d8b' : 'rgba(255,255,255,0.1)' }}
              animate={play ? { backgroundColor: i < SEATS - 2 ? '#ff3d8b' : 'rgba(255,255,255,0.1)' } : undefined}
              transition={{ duration: 0.3, delay: 0.8 + i * 0.045 }}
            />
          ))}
        </div>
      </div>

      <p className="mt-5 text-[10px] leading-4 text-white/35">Illustrative. Results vary by cafe, location and capacity.</p>
    </div>
  );
}
