'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

// Two giant outlined text rows that slide in opposite directions as you scroll past.
export default function ScrollBand({ top, bottom }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-35%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['-35%', '0%']);
  const row = 'whitespace-nowrap font-display text-[clamp(4rem,14vw,14rem)] uppercase leading-[0.9]';

  return (
    <div ref={ref} className="overflow-hidden bg-black py-16" aria-hidden="true">
      <motion.p className={`${row} text-white`} style={reduce ? undefined : { x: x1 }}>
        {top}
      </motion.p>
      <motion.p
        className={`${row} text-transparent [-webkit-text-stroke:2px_#ff3d8b]`}
        style={reduce ? undefined : { x: x2 }}
      >
        {bottom}
      </motion.p>
    </div>
  );
}
