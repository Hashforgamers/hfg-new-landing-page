'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function HelpCenterModal({ isOpen, onClose }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleMouseMove = (event) => {
    const { width, height, left, top } = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - left - width / 2) / 24;
    const y = (event.clientY - top - height / 2) / 24;
    setPosition({ x, y });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setPosition({ x: 0, y: 0 })}
        className="relative mx-4 w-full max-w-5xl overflow-hidden rounded-3xl border border-orange-300/30 shadow-[0_20px_90px_rgba(255,90,160,0.3)]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-200 ease-out"
          style={{
            backgroundImage: "url('/gta6-miami-sunset.jpg')",
            transform: `translate(${position.x}px, ${position.y}px) scale(1.06)`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(7,3,14,0.96)_10%,rgba(30,8,37,0.86)_45%,rgba(51,13,46,0.62)_100%)]" />
        <div className="absolute inset-y-0 right-0 hidden w-[45%] bg-[url('/images/retro-car.jpg')] bg-cover bg-center opacity-30 lg:block" />

        <div className="relative z-10 grid grid-cols-1 text-white md:grid-cols-2">
          <div className="border-b border-white/10 p-8 md:border-b-0 md:border-r md:border-white/10 md:p-10">
            <p className="text-xs uppercase tracking-[0.38em] text-orange-200/85">Support - Help Center</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-white">Need Help?</h2>
            <p className="mt-4 text-sm leading-7 text-white/80 md:text-base">
              We are here to assist with bookings, payments, account flow and app-related concerns.
            </p>

            <div className="mt-6 space-y-3 text-sm text-white/85">
              <p className="rounded-xl border border-orange-300/30 bg-orange-300/10 px-4 py-3">
                Support Email: support@hashforgamers.co.in
              </p>
              <p className="rounded-xl border border-pink-300/30 bg-pink-300/10 px-4 py-3">
                Help and FAQs are available inside the app.
              </p>
              <p className="rounded-xl border border-violet-300/30 bg-violet-300/10 px-4 py-3">
                Business and partnership support is available via website contact.
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <h3 className="text-2xl font-bold text-orange-100">Company Info</h3>
            <div className="mt-5 space-y-4 text-sm text-white/85">
              <p className="rounded-xl border border-white/15 bg-white/[0.04] p-4">
                <span className="text-orange-200">Company Name</span>
                <br />
                Hash For Gamers Private Limited
              </p>
              <p className="rounded-xl border border-white/15 bg-white/[0.04] p-4">
                <span className="text-orange-200">Support Email</span>
                <br />
                support@hashforgamers.co.in
              </p>
              <p className="rounded-xl border border-white/15 bg-white/[0.04] p-4">
                <span className="text-orange-200">Website</span>
                <br />
                www.hashforgamers.com
              </p>
              <p className="rounded-xl border border-white/15 bg-white/[0.04] p-4">
                <span className="text-orange-200">Registered Office</span>
                <br />
                Mumbai, Maharashtra, India
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-black/35 p-2 text-white/70 transition hover:border-orange-300/60 hover:text-orange-200"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
