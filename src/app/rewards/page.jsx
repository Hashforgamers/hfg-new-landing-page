"use client";

import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";

const FEATURE_CHIPS = [
  "Rewards Coming Soon",
  "Loyalty System Upgrade",
  "Early Preview Theme",
  "Upcoming Features",
];

const UPCOMING_LIST = [
  { title: "Rewards Roadmap", text: "The complete loyalty module is under development and will launch soon." },
  { title: "XP and Tier System", text: "Progression, streaks, and member level rewards are currently upcoming." },
  { title: "Premium Perks", text: "Exclusive offers, bonus drops, and unlockables will be available in future updates." },
];

export default function RewardsPage() {
  const rotateXInput = useMotionValue(0);
  const rotateYInput = useMotionValue(0);

  const cardRotateX = useTransform(rotateXInput, [-1, 1], [8, -8]);
  const cardRotateY = useTransform(rotateYInput, [-1, 1], [-8, 8]);
  const glowMoveX = useTransform(rotateYInput, [-1, 1], [-45, 45]);
  const glowMoveY = useTransform(rotateXInput, [-1, 1], [-30, 30]);

  const handleMove = (event) => {
    const { currentTarget, clientX, clientY } = event;
    const bounds = currentTarget.getBoundingClientRect();
    const px = (clientX - bounds.left) / bounds.width;
    const py = (clientY - bounds.top) / bounds.height;
    rotateXInput.set(py * 2 - 1);
    rotateYInput.set(px * 2 - 1);
  };

  const handleLeave = () => {
    rotateXInput.set(0);
    rotateYInput.set(0);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#110818] text-white"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="absolute inset-0">
        <Image
          src="/gta6-miami-sunset.jpg"
          alt="Neon city sunset"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,6,32,0.2)_0%,rgba(9,4,15,0.82)_55%,rgba(5,3,10,0.96)_100%)]" />
      </div>

      <motion.div
        style={{ x: glowMoveX, y: glowMoveY }}
        className="pointer-events-none absolute left-1/2 top-[28%] h-80 w-80 -translate-x-1/2 rounded-full bg-[#ff7f50]/30 blur-[100px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-14 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ rotateX: cardRotateX, rotateY: cardRotateY, transformPerspective: 1500 }}
          className="rounded-[34px] border border-[#ff9a63]/35 bg-black/28 p-7 shadow-[0_24px_90px_rgba(255,90,160,0.3)] backdrop-blur-xl md:p-10"
        >
          <p className="text-xs uppercase tracking-[0.42em] text-orange-200/85">Hash Rewards - Upcoming</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Rewards System Is Coming Soon
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 md:text-base">
            This page is an upcoming preview. Rewards, tiers, and loyalty features are in active development.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {FEATURE_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-pink-300/35 bg-pink-300/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-pink-100"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative min-h-[320px] overflow-hidden rounded-3xl border border-white/15"
          >
            <Image
              src="/images/retro-car.jpg"
              alt="Retro neon performance car"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.75)_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Theme Preview</p>
              <h2 className="mt-2 text-3xl font-black">Upcoming Rewards Experience</h2>
              <p className="mt-2 text-sm text-white/75">Visual theme is live, while all rewards functionality will arrive in upcoming releases.</p>
            </div>
          </motion.div>

          <div className="space-y-4">
            {UPCOMING_LIST.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-lg"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-orange-200">Upcoming Module</p>
                <h3 className="mt-2 text-2xl font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/75">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="rounded-2xl border border-orange-300/40 bg-orange-300/10 p-5 text-center text-sm font-semibold tracking-[0.24em] text-orange-100"
        >
          REWARDS SYSTEM BOOTING SOON
        </motion.div>
      </div>
    </div>
  );
}
