'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

// Hero scroll choreography: background sinks and zooms, copy rises and fades, like a title card.
export function HeroScene({ background, children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div ref={ref} className="absolute inset-0">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: bgY, scale: bgScale }}>
        {background}
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-end"
        style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Each headline line slides up out of a mask on load.
export function RevealLine({ children, delay = 0, className = '' }) {
  const reduce = useReducedMotion();
  return (
    <span className="block overflow-hidden pb-[0.04em]">
      <motion.span
        className={`block ${className}`}
        initial={reduce ? false : { y: '105%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>{" "}
    </span>
  );
}

export function FadeUp({ children, delay = 0, className = '' }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
