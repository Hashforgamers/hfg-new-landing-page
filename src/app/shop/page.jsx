"use client";

import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useMemo, useState } from "react";

const PRODUCTS = [
  {
    id: 1,
    name: "Neon Pulse Headset",
    tag: "Audio Gear",
    price: 4499,
    accent: "from-orange-400/50 to-pink-500/35",
  },
  {
    id: 2,
    name: "Midnight RGB Keyboard",
    tag: "Control Gear",
    price: 3799,
    accent: "from-fuchsia-400/45 to-violet-500/30",
  },
  {
    id: 3,
    name: "Streetline Pro Mouse",
    tag: "Precision Gear",
    price: 2299,
    accent: "from-cyan-400/45 to-blue-500/30",
  },
];

export default function ShopGearPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const rotateXInput = useMotionValue(0);
  const rotateYInput = useMotionValue(0);

  const heroRotateX = useTransform(rotateXInput, [-1, 1], [8, -8]);
  const heroRotateY = useTransform(rotateYInput, [-1, 1], [-8, 8]);
  const glowX = useTransform(rotateYInput, [-1, 1], [-40, 40]);
  const glowY = useTransform(rotateXInput, [-1, 1], [-28, 28]);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price, 0),
    [cartItems]
  );

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

  const addToCart = (product) => {
    setCartItems((prev) => [...prev, product]);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#12071a] text-white"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="absolute inset-0">
        <Image
          src="/gta6-miami-sunset.jpg"
          alt="Neon sunset city"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,7,31,0.25)_0%,rgba(11,5,18,0.85)_55%,rgba(8,4,14,0.96)_100%)]" />
      </div>

      <motion.div
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none absolute left-1/2 top-[22%] h-80 w-80 -translate-x-1/2 rounded-full bg-[#ff7f50]/30 blur-[100px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-14 md:py-18">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ rotateX: heroRotateX, rotateY: heroRotateY, transformPerspective: 1400 }}
          className="rounded-[34px] border border-[#ff9b66]/35 bg-black/28 p-7 shadow-[0_20px_90px_rgba(255,70,160,0.28)] backdrop-blur-xl md:p-10"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.38em] text-orange-200/85">Hash Shop - Upcoming</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Store Experience Coming Soon
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 md:text-base">
                Theme preview is live with neon city style. Product drops and full shopping flow are launching in upcoming updates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="rounded-full border border-pink-300/40 bg-pink-300/15 px-6 py-3 text-sm font-semibold text-pink-100 transition hover:scale-[1.02] hover:bg-pink-300/25"
            >
              Cart ({cartItems.length})
            </button>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
              style={{ transformPerspective: 1100 }}
              className="rounded-2xl border border-white/15 bg-white/[0.05] p-5 backdrop-blur-xl"
            >
              <div className={`h-44 rounded-xl bg-gradient-to-br ${product.accent}`} />

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-orange-200/90">{product.tag}</p>
                <p className="text-lg font-bold">INR {product.price}</p>
              </div>

              <h2 className="mt-2 text-2xl font-bold leading-tight">{product.name}</h2>
              <p className="mt-2 text-sm text-white/75">Upcoming catalog item. Final stock and checkout will be unlocked soon.</p>

              <button
                type="button"
                onClick={() => addToCart(product)}
                className="mt-5 w-full rounded-xl bg-orange-300 py-3 font-semibold text-black transition hover:bg-orange-200"
              >
                Add to Cart
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="relative mt-8 min-h-[220px] overflow-hidden rounded-2xl border border-white/15"
        >
          <Image
            src="/images/retro-car.jpg"
            alt="Retro car theme preview"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.78)_100%)]" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Theme Preview</p>
            <h3 className="mt-2 text-3xl font-black">Neon Storefront Experience</h3>
            <p className="mt-2 text-sm text-white/75">Visual theme is active. Complete store functionality remains upcoming.</p>
          </div>
        </motion.div>
      </div>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#140a21]/95 p-6 backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="absolute right-3 top-3 rounded-full border border-white/20 px-3 py-1 text-sm text-white/70 hover:text-white"
            >
              X
            </button>

            <h2 className="text-2xl font-bold">Your Cart</h2>
            <p className="mt-1 text-sm text-white/60">Preview mode</p>

            <div className="mt-5 max-h-64 space-y-3 overflow-auto pr-1">
              {cartItems.length === 0 && (
                <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
                  Cart is empty. Products are preview-only for now.
                </p>
              )}

              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-sm text-orange-200">INR {item.price}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-orange-300/35 bg-orange-300/12 px-4 py-3">
              <p className="text-sm uppercase tracking-[0.2em] text-orange-200">Total</p>
              <p className="text-xl font-bold text-orange-100">INR {cartTotal}</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
