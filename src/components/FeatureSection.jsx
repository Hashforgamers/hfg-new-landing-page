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
      className="min-h-screen w-screen overflow-hidden bg-black px-4 py-12 sm:px-6 lg:px-10"
    >
      <div className="relative mx-auto flex min-h-[88vh] w-full max-w-[1400px] items-center justify-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),transparent_42%)]" />

        <motion.div
          className="absolute left-0 top-[16%] z-30 hidden rounded-[28px] border border-white/10 bg-black/45 px-5 py-4 text-white/80 backdrop-blur-md md:block"
          initial={{ opacity: 0, x: -64, rotate: -6 }}
          animate={isInView ? { opacity: 1, x: 0, rotate: -3 } : { opacity: 0, x: -64, rotate: -6 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-300">Fast Booking</p>
          <p className="mt-2 max-w-[180px] text-sm leading-6">
            Hash cuts through friction and gets premium players from browse to booked in a few taps.
          </p>
        </motion.div>

        <motion.div
          className="absolute right-0 top-[24%] z-30 hidden rounded-[28px] border border-white/10 bg-black/45 px-5 py-4 text-white/80 backdrop-blur-md lg:block"
          initial={{ opacity: 0, x: 72, rotate: 6 }}
          animate={isInView ? { opacity: 1, x: 0, rotate: 3 } : { opacity: 0, x: 72, rotate: 6 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-fuchsia-300">Play Identity</p>
          <p className="mt-2 max-w-[180px] text-sm leading-6">
            Progress, status, and rewards turn Hash into a gamer identity brand, not a utility layer.
          </p>
        </motion.div>

        <motion.div
          className="relative flex h-full w-full items-center justify-center"
          initial={{ opacity: 0, y: 48, scale: 0.92 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 48, scale: 0.92 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <div className="grid w-full max-w-[1260px] items-center gap-5 lg:grid-cols-[0.7fr_1.4fr_0.7fr]">
            <motion.div
              className="relative z-20 mx-auto hidden h-[52vh] w-full max-w-[260px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.35)] lg:block"
              initial={{ opacity: 0, x: -42, rotate: -5 }}
              animate={isInView ? { opacity: 1, x: 0, rotate: -2 } : { opacity: 0, x: -42, rotate: -5 }}
              transition={{ duration: 0.85, delay: 0.1, ease: 'easeOut' }}
            >
              <Image
                src="/images/iPhone 16 - 1.png"
                alt="Hash mobile booking preview"
                fill
                sizes="260px"
                className="object-contain p-4"
              />
            </motion.div>

            <div className="relative z-10 h-[62vh] w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#061017] shadow-[0_24px_100px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-300">
                  Hash Product View
                </p>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
              </div>

              <Image
                src="/images/features.png"
                alt="Hash app features and product screens"
                fill
                sizes="(max-width: 1024px) 100vw, 720px"
                className="object-contain p-5 pt-16"
              />
            </div>

            <motion.div
              className="relative z-20 mx-auto hidden h-[52vh] w-full max-w-[260px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.35)] lg:block"
              initial={{ opacity: 0, x: 42, rotate: 5 }}
              animate={isInView ? { opacity: 1, x: 0, rotate: 2 } : { opacity: 0, x: 42, rotate: 5 }}
              transition={{ duration: 0.85, delay: 0.16, ease: 'easeOut' }}
            >
              <Image
                src="/images/Home.png"
                alt="Hash home screen preview"
                fill
                sizes="260px"
                className="object-contain p-4"
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-[12%] left-[6%] z-30 hidden max-w-[220px] rounded-[28px] border border-white/10 bg-black/45 px-5 py-4 text-white/80 backdrop-blur-md xl:block"
          initial={{ opacity: 0, y: 42, rotate: 5 }}
          animate={isInView ? { opacity: 1, y: 0, rotate: 2 } : { opacity: 0, y: 42, rotate: 5 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.18 }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-amber-300">Rewards Layer</p>
          <p className="mt-2 text-sm leading-6">
            Premium ecosystems win when rewards feel native, immediate, and worth chasing.
          </p>
        </motion.div>

        <motion.div
          className="absolute bottom-[8%] left-[6%] right-[6%] z-30 rounded-[28px] border border-white/10 bg-gradient-to-r from-black/55 via-black/25 to-black/55 px-4 py-4 text-center text-white/75 backdrop-blur-md md:left-[16%] md:right-[16%]"
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          transition={{ duration: 0.75, delay: 0.2 }}
        >
          <p className="text-[10px] uppercase tracking-[0.38em] text-cyan-300">Core Flow</p>
          <div className="mt-2 grid gap-2 text-left sm:grid-cols-3">
            <p className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs leading-5 text-white/80">
              Reserve premium setups
            </p>
            <p className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs leading-5 text-white/80">
              Build gamer status
            </p>
            <p className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs leading-5 text-white/80">
              Enter the network
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
