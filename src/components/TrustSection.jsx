'use client';

import { motion, useInView, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: '40+', label: 'premium cafe leads', detail: 'High-quality operators are a stronger moat than raw volume when you are building a premium brand.' },
  { value: '4', label: 'elite player loops', detail: 'Discovery, access, rewards, and community sit inside one elevated gaming system.' },
  { value: '3', label: 'power audiences', detail: 'Players, operators, and communities all win when the platform sets a higher standard.' },
];

const proofPoints = [
  'Built for gamers who care about setup quality, speed, and status.',
  'Designed for premium cafe operators who want better retention and cleaner bookings.',
  'Positioned as the identity layer for gaming culture, not just another scheduling tool.',
];

export default function TrustSection() {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.25 });
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
      } catch {}

      video.currentTime = 0.01;
      setIsVideoReady(true);
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

  useMotionValueEvent(scrollYProgress, 'change', async (value) => {
    if (!duration) return;
    targetTimeRef.current = value * duration;
  });

  return (
    <section
      ref={ref}
      className="relative min-h-[112vh] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(22,255,0,0.15),transparent_32%),linear-gradient(180deg,#050505_0%,#0b0b0b_100%)] px-5 py-12 sm:px-8 lg:px-12 lg:py-14"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="metadata"
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            isVideoReady ? 'opacity-55' : 'opacity-0'
          }`}
        >
          <source src="/videos/8064-206468120_medium.mp4" type="video/mp4" />
        </video>
        {!isVideoReady && (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0d1e12_0%,#08110a_50%,#050505_100%)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,3,0.66)_0%,rgba(0,0,0,0.48)_42%,rgba(3,5,4,0.76)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(22,255,0,0.18),transparent_32%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 lg:sticky lg:top-8 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-[#16FF00]">
            Premium Signal
          </p>
          <h2 className="mt-4 text-3xl font-black uppercase tracking-[0.12em] text-white sm:text-4xl lg:text-5xl">
            Hash should look expensive because it is built to be elite.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
            Premium brands do not rely on noise. They signal standards, control, and repeatable quality. Hash is being built to own premium gaming access, not to blend into low-effort booking apps.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
              transition={{ duration: 0.7, delay: index * 0.08, ease: 'easeOut' }}
              className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              <p className="text-4xl font-black text-white sm:text-5xl">{stat.value}</p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#16FF00]">
                {stat.label}
              </p>
              <p className="mt-4 text-sm leading-6 text-white/68">{stat.detail}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.8, delay: 0.18, ease: 'easeOut' }}
          className="grid gap-4 rounded-[32px] border border-white/10 bg-black/35 p-6 backdrop-blur-md md:grid-cols-3"
        >
          {proofPoints.map((point) => (
            <div key={point} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-4 h-2 w-2 rounded-full bg-[#16FF00] shadow-[0_0_18px_#16FF00]" />
              <p className="text-sm leading-6 text-white/78">{point}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
