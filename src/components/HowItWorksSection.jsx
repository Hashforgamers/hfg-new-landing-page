'use client';

import { motion, useInView, useMotionValueEvent, useScroll } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SITE_DOWNLOAD_URL } from '@/lib/site';

const steps = [
  {
    number: '01',
    title: 'Scout the arena',
    copy: 'Open Hash, scan elite cafes, compare setups, and choose the location that matches your level.',
  },
  {
    number: '02',
    title: 'Lock your slot',
    copy: 'Pick the rig, reserve the time, and secure your station without calls, delays, or awkward back-and-forth.',
  },
  {
    number: '03',
    title: 'Walk in like a priority player',
    copy: 'Arrive with the booking confirmed, your identity active, and the full Hash ecosystem already working in your favor.',
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.2 });
  const [duration, setDuration] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const targetTimeRef = useRef(0);
  const rafRef = useRef(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncDuration = () => {
      if (Number.isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };

    const primeFrame = async () => {
      try {
        await video.play();
        video.pause();
        video.currentTime = 0.01;
        setIsVideoReady(true);
      } catch {
        video.currentTime = 0.01;
        setIsVideoReady(true);
      }
    };

    const smoothScrub = () => {
      const current = video.currentTime;
      const target = targetTimeRef.current;
      const next = current + (target - current) * 0.18;

      if (Math.abs(target - current) > 0.01) {
        video.currentTime = next;
      }

      rafRef.current = requestAnimationFrame(smoothScrub);
    };

    video.pause();
    video.muted = true;
    video.playsInline = true;
    video.load();
    syncDuration();
    video.addEventListener('loadedmetadata', syncDuration);
    video.addEventListener('loadeddata', primeFrame, { once: true });
    rafRef.current = requestAnimationFrame(smoothScrub);

    return () => {
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener('loadedmetadata', syncDuration);
      video.removeEventListener('loadeddata', primeFrame);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (!duration) return;
    targetTimeRef.current = value * duration;
  });

  return (
    <section
      ref={ref}
      className="relative min-h-[180vh] overflow-hidden bg-[linear-gradient(180deg,#040404_0%,#08110a_45%,#040404_100%)] px-5 py-20 sm:px-8 lg:px-12"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          src="/videos/booking-step.mp4"
          muted
          playsInline
          preload="metadata"
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            isVideoReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {!isVideoReady && (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0d1e12_0%,#08110a_50%,#050505_100%)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.54)_0%,rgba(0,0,0,0.28)_35%,rgba(0,0,0,0.5)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,255,0,0.16),transparent_38%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-[#16FF00]">
              Lock-In Flow
            </p>
            <h2 className="mt-4 text-3xl font-black uppercase tracking-[0.12em] text-white sm:text-4xl lg:text-5xl">
              Three moves. Premium access.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">
              The value proposition should hit instantly: discover the best spot, reserve the exact setup, and enter with no friction.
            </p>
          </div>

          <Link
            href={SITE_DOWNLOAD_URL}
            className="inline-flex w-fit items-center rounded-full border border-[#16FF00]/40 bg-[#16FF00]/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#16FF00] transition hover:bg-[#16FF00] hover:text-black"
          >
            Download Hash
          </Link>
        </motion.div>

        <div className="grid gap-4 lg:ml-auto lg:max-w-[540px]">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: 0.75, delay: 0.08, ease: 'easeOut' }}
            className="rounded-[28px] border border-white/10 bg-black/35 px-5 py-4 text-white/78 backdrop-blur-md"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#16FF00]">
              Background Sequence
            </p>
            <p className="mt-3 text-sm leading-7">
              Scroll the sequence and watch the booking flow advance behind the copy, so the product feels cinematic and controlled instead of static.
            </p>
          </motion.div>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
                transition={{ duration: 0.75, delay: index * 0.08, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur-md"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-5xl font-black text-white/16">{step.number}</span>
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#16FF00]">
                    Step {step.number}
                  </span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-[0.08em] text-white">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/72">{step.copy}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
