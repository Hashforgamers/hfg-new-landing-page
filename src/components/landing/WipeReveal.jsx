'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

// Uncovers its content bottom-to-top with a clip-path wipe, with a slight settle in scale.
// The outer box is never clipped, so it is what we watch for visibility.
export default function WipeReveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduce = useReducedMotion();

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full"
        initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.06 }}
        animate={reduce || inView ? { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 } : undefined}
        transition={{ duration: 1.1, delay, ease: [0.76, 0, 0.24, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
