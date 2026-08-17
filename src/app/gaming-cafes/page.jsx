"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

const DEVICE_PRICING = {
  PC: 100,
  PS5: 200,
  Xbox: 180,
};

const EXTRA_PRICING = {
  Headset: 50,
  "Extra Controller": 70,
  Snacks: 100,
};

const FLOATING_STATS = [
  { label: "4.9 Rating", value: "2K+ Reviews" },
  { label: "Ping Ready", value: "<10ms Arena" },
  { label: "Rig Quality", value: "RTX Setup" },
];

export default function GamingCafePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    device: "PC",
    date: "",
    time: "",
    hours: 1,
    extras: [],
    payment: "Cash",
  });

  const rotateXSource = useMotionValue(0);
  const rotateYSource = useMotionValue(0);
  const cardX = useTransform(rotateXSource, [-1, 1], [9, -9]);
  const cardY = useTransform(rotateYSource, [-1, 1], [-9, 9]);
  const glowX = useTransform(rotateYSource, [-1, 1], [-40, 40]);
  const glowY = useTransform(rotateXSource, [-1, 1], [-30, 30]);

  const total = useMemo(() => {
    const safeHours = Number.isFinite(form.hours) && form.hours > 0 ? form.hours : 1;
    const base = safeHours * DEVICE_PRICING[form.device];
    const extraTotal = form.extras.reduce((sum, item) => sum + EXTRA_PRICING[item], 0);
    return base + extraTotal;
  }, [form]);

  const handleMouseMove = (event) => {
    const { currentTarget, clientX, clientY } = event;
    const rect = currentTarget.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    rotateXSource.set(y * 2 - 1);
    rotateYSource.set(x * 2 - 1);
  };

  const handleMouseLeave = () => {
    rotateXSource.set(0);
    rotateYSource.set(0);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#060911] text-white">
      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-14"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0">
          <Image
            src="/cyber-bg.jpeg"
            alt="Gaming cyber arena"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(32,113,255,0.25),transparent_38%),radial-gradient(circle_at_80%_25%,rgba(255,67,175,0.28),transparent_35%),linear-gradient(180deg,rgba(2,4,10,0.72),rgba(2,3,7,0.96))]" />
        </div>

        <motion.div
          style={{ x: glowX, y: glowY }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-[90px]"
        />

        <motion.div
          initial={{ opacity: 0, y: 42 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ rotateX: cardX, rotateY: cardY, transformPerspective: 1400 }}
          className="relative z-10 w-full max-w-6xl rounded-[34px] border border-white/15 bg-black/30 p-7 backdrop-blur-2xl md:p-10"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_0.85fr]">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xs uppercase tracking-[0.42em] text-cyan-300"
              >
                Hash Gaming Cafes
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl"
              >
                Book a gaming arena with instant premium slots.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36 }}
                className="mt-5 max-w-2xl text-sm leading-7 text-white/75 md:text-base"
              >
                High refresh setups, low latency network zones, and high comfort battle pods for solo and squad sessions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="rounded-full bg-cyan-400 px-8 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-cyan-300"
                >
                  Book Your Slot
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white/90 transition hover:border-white hover:bg-white/10"
                >
                  Explore Cafes
                </button>
              </motion.div>
            </div>

            <div className="relative space-y-4">
              {FLOATING_STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{stat.label}</p>
                  <p className="mt-1 text-xl font-semibold">{stat.value}</p>
                </motion.div>
              ))}

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-2xl border border-cyan-300/35 bg-cyan-300/15 p-4 backdrop-blur-xl"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Live Seats</p>
                <p className="mt-1 text-2xl font-bold"> Available Now</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 pb-14 md:grid-cols-3">
        {[
          "Tournament grade peripherals",
          "4K stream booths + private pods",
          "24x7 support and snack lounge",
        ].map((feature, index) => (
          <motion.div
            key={feature}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/80"
          >
            {feature}
          </motion.div>
        ))}
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-[#0a0f1f]/95 p-7 text-white shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full border border-white/20 px-3 py-1 text-sm text-white/70 transition hover:border-white hover:text-white"
            >
              X
            </button>

            <h2 className="mb-6 text-center text-2xl font-bold">Book Your Gaming Slot</h2>

            <div className="grid gap-4">
              <input
                type="text"
                value={form.name}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 outline-none transition focus:border-cyan-300"
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />

              <input
                type="tel"
                value={form.phone}
                placeholder="Phone number"
                className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 outline-none transition focus:border-cyan-300"
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              />

              <select
                value={form.device}
                className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 outline-none transition focus:border-cyan-300"
                onChange={(event) => setForm((prev) => ({ ...prev, device: event.target.value }))}
              >
                <option value="PC">PC (INR 100/hr)</option>
                <option value="PS5">PS5 (INR 200/hr)</option>
                <option value="Xbox">Xbox (INR 180/hr)</option>
              </select>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="date"
                  value={form.date}
                  className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 outline-none transition focus:border-cyan-300"
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                />
                <input
                  type="time"
                  value={form.time}
                  className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 outline-none transition focus:border-cyan-300"
                  onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
                />
              </div>

              <input
                type="number"
                min="1"
                value={form.hours}
                placeholder="Hours"
                className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 outline-none transition focus:border-cyan-300"
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  setForm((prev) => ({ ...prev, hours: parsed > 0 ? parsed : 1 }));
                }}
              />

              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.22em] text-white/65">Extra Services</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {Object.keys(EXTRA_PRICING).map((item) => {
                    const isSelected = form.extras.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            extras: isSelected
                              ? prev.extras.filter((service) => service !== item)
                              : [...prev.extras, item],
                          }))
                        }
                        className={`rounded-xl border px-3 py-2 text-xs transition ${
                          isSelected
                            ? "border-cyan-300 bg-cyan-300/20 text-cyan-100"
                            : "border-white/15 bg-white/[0.04] text-white/70 hover:border-white/35"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <select
                value={form.payment}
                className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 outline-none transition focus:border-cyan-300"
                onChange={(event) => setForm((prev) => ({ ...prev, payment: event.target.value }))}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </select>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Total</p>
              <p className="text-xl font-bold text-cyan-200">INR {total}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                alert("Booking successful");
                setIsOpen(false);
              }}
              className="mt-5 w-full rounded-xl bg-cyan-400 py-3 font-semibold text-black transition hover:scale-[1.01] hover:bg-cyan-300"
            >
              Confirm Booking
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
