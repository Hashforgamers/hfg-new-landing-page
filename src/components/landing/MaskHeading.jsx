'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

// Section heading whose words slide up out of a mask when it scrolls into view.
// Visibility is measured on the unclipped heading itself (a masked child never counts as visible).
// Text stays in the DOM as plain words, so it reads normally for SEO and screen readers.
export default function MaskHeading({ as: Tag = 'h2', id, className = '', children, stagger = 0.06 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const words = String(children).split(' ');
  const shown = reduce || inView;

  return (
    <Tag ref={ref} id={id} className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: '110%', rotate: 4 }}
            animate={shown ? { y: '0%', rotate: 0 } : undefined}
            transition={{ duration: 0.85, delay: i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  );
}
