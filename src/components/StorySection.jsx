"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

export default function StorySection({
  id,
  chapter,
  title,
  subtitle,
  align = "left",
  accent = "#F59E0B",
  showSeparator = true,
  children,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.25, once: false });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const mediaY = useTransform(scrollYProgress, [0, 1], [64, -64]);
  const mediaScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.96, 1, 0.98]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.15, 1, 1, 0.15]);
  const railScale = useTransform(scrollYProgress, [0, 1], [0.35, 1]);

  const isRight = align === "right";

  return (
    <section
      id={id}
      ref={ref}
      className="relative isolate overflow-hidden"
      style={{ minHeight: "100svh" }}
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32"
        style={{
          opacity: overlayOpacity,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.32) 55%, rgba(0,0,0,0) 100%)",
        }}
      />

      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40"
        style={{
          opacity: overlayOpacity,
          background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${accent}22 44%, rgba(0,0,0,0.92) 100%)`,
        }}
      />

      <motion.div
        className="relative z-10 will-change-transform"
        style={{ y: mediaY, scale: mediaScale }}
      >
        {children}
      </motion.div>

      <motion.div
        className={`pointer-events-none absolute inset-x-0 top-0 z-30 flex px-5 pt-6 sm:px-8 sm:pt-8 lg:px-12 lg:pt-10 ${
          isRight ? "justify-end" : "justify-start"
        }`}
        initial={{ opacity: 0, y: 36 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0.2, y: 24 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div
          className={`max-w-[320px] rounded-[28px] border border-white/10 bg-black/30 p-4 backdrop-blur-md sm:max-w-[420px] sm:p-5 lg:p-6 ${
            isRight ? "text-right" : "text-left"
          }`}
        >
          <motion.div
            className={`mb-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.45em] sm:text-xs ${
              isRight ? "justify-end" : "justify-start"
            }`}
            style={{ color: accent }}
          >
            <span>{chapter}</span>
            <motion.span
              className="h-px w-16 origin-left bg-current sm:w-24"
              style={{ scaleX: railScale }}
            />
          </motion.div>

          <h2 className="text-2xl font-black uppercase tracking-[0.18em] text-white sm:text-3xl lg:text-4xl">
            {title}
          </h2>

          <p className="mt-2 max-w-md text-xs leading-5 text-white/72 sm:text-sm sm:leading-6">
            {subtitle}
          </p>
        </div>
      </motion.div>

      {showSeparator && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-5 pb-4 sm:px-8 sm:pb-6"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0.25, y: 12 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        >
          <div className="relative flex w-full max-w-4xl items-center justify-center gap-3 overflow-hidden rounded-full border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
            <motion.span
              className="h-px flex-1 origin-right"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${accent} 100%)`,
                scaleX: railScale,
              }}
            />
            <motion.div
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1"
              animate={isInView ? { scale: [0.98, 1.03, 1] } : { scale: 0.98 }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.2 }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: accent, boxShadow: `0 0 18px ${accent}` }}
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/80 sm:text-xs">
                Next Sequence
              </span>
            </motion.div>
            <motion.span
              className="h-px flex-1 origin-left"
              style={{
                background: `linear-gradient(90deg, ${accent} 0%, transparent 100%)`,
                scaleX: railScale,
              }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}
