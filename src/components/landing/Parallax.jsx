'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

// Moves its children vertically as the element crosses the viewport.
// speed > 0 drifts slower than the page (background feel); speed < 0 drifts faster.
export default function Parallax({ children, speed = 0.2, className = '', scale = false }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const distance = speed * 300;
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  const s = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  return (
    <div ref={ref} className={className}>
      <motion.div className="h-full w-full" style={reduce ? undefined : { y, scale: scale ? s : 1 }}>
        {children}
      </motion.div>
    </div>
  );
}
