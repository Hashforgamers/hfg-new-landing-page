'use client';

import Image from 'next/image';
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.3, once: false });

  return (
    <section
      ref={ref}
      className="w-screen h-screen overflow-hidden bg-black px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="relative mx-auto flex h-full w-full max-w-[1400px] items-center justify-center">
        <motion.div
          className="absolute left-0 top-[16%] hidden rounded-[28px] border border-white/10 bg-black/45 px-5 py-4 text-white/80 backdrop-blur-md md:block"
          initial={{ opacity: 0, x: -64, rotate: -6 }}
          animate={isInView ? { opacity: 1, x: 0, rotate: -3 } : { opacity: 0, x: -64, rotate: -6 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-300">Fast Booking</p>
          <p className="mt-2 max-w-[180px] text-sm leading-6">
            Quick mission-select flow for cafes, slots, and game stations.
          </p>
        </motion.div>

        <motion.div
          className="absolute right-0 top-[24%] hidden rounded-[28px] border border-white/10 bg-black/45 px-5 py-4 text-white/80 backdrop-blur-md lg:block"
          initial={{ opacity: 0, x: 72, rotate: 6 }}
          animate={isInView ? { opacity: 1, x: 0, rotate: 3 } : { opacity: 0, x: 72, rotate: 6 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-fuchsia-300">Play Identity</p>
          <p className="mt-2 max-w-[180px] text-sm leading-6">
            Stronger utility framing so the static feature art lands like a reveal board.
          </p>
        </motion.div>

        <motion.div
          className="relative h-full w-full"
          initial={{ opacity: 0, y: 48, scale: 0.92 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 48, scale: 0.92 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <Image
            src="/images/features.png"  
            alt="App Features"
            fill
            sizes="100vw"
            className="object-contain"
          />
        </motion.div>

        <motion.div
          className="absolute bottom-[16%] left-[10%] right-[10%] rounded-[28px] border border-white/10 bg-gradient-to-r from-black/55 via-black/25 to-black/55 px-4 py-3 text-center text-white/75 backdrop-blur-md sm:left-[16%] sm:right-[16%] md:hidden"
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          transition={{ duration: 0.75, delay: 0.2 }}
        >
          <p className="text-[10px] uppercase tracking-[0.38em] text-cyan-300">Core Flow</p>
          <p className="mt-1 text-xs leading-5">
            Booking, gaming identity, and rewards presented like a cinematic stat sheet.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
