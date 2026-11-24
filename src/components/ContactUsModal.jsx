'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function ContactUsModal({ isOpen, onClose }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleMouseMove = (e) => {
    const { width, height, left, top } =
      e.currentTarget.getBoundingClientRect();

    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;

    setPosition({ x, y });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

      {/* Modal */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setPosition({ x: 0, y: 0 })}
        className="relative w-full max-w-5xl mx-4 rounded-2xl overflow-hidden shadow-2xl"
      >

        {/* 3D Parallax Background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-200 ease-out"
          style={{
            backgroundImage: "url('/contact-us.webp')",
            transform: `translate(${position.x}px, ${position.y}px) scale(1.05)`
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-purple-900/70" />

        {/* Content */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 text-white">

          {/* Left Section */}
          <div className="p-10 flex flex-col justify-center border-r border-green-400/20">
            <h2 className="text-4xl font-bold text-green-400 mb-4">
              Contact Us
            </h2>

            <p className="text-gray-300 mb-6">
              Have questions about our gaming stations? Need help with booking?
              Our support warriors are ready to assist you.
            </p>

            <div className="space-y-2 text-sm text-gray-300">
              <p className="font-semibold text-green-400">
                Emergency Support 24/7
              </p>
              <p>Email: support@hashforgamers.co.in</p>
              <p>Phone: +91 9137757935</p>
              <p>Asmita Garden, Mira Road, Mumbai</p>
            </div>
          </div>

          {/* Right Section (Form) */}
          <div className="p-10 backdrop-blur-xl bg-black/40">
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your full name"
                className="w-full rounded-md bg-black/50 border border-green-400/30 
                text-white p-3 focus:ring-2 focus:ring-green-400 outline-none"
              />

              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-md bg-black/50 border border-green-400/30 
                text-white p-3 focus:ring-2 focus:ring-green-400 outline-none"
              />

              <input
                type="text"
                placeholder="Subject"
                className="w-full rounded-md bg-black/50 border border-green-400/30 
                text-white p-3 focus:ring-2 focus:ring-green-400 outline-none"
              />

              <textarea
                rows={4}
                placeholder="Write your message here..."
                className="w-full rounded-md bg-black/50 border border-green-400/30 
                text-white p-3 focus:ring-2 focus:ring-green-400 outline-none"
              />

              <button
                type="submit"
                className="w-full bg-green-400 hover:bg-green-500 text-black 
                font-bold py-3 rounded-md transition shadow-lg 
                shadow-green-500/30"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-green-400 transition z-20"
        >
          <X size={28} />
        </button>
      </div>
    </div>
  );
}
