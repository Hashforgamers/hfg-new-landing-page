"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function AboutUsModal({ isOpen, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      
      <div
        className={`relative w-full max-w-5xl mx-4 max-h-[90vh] rounded-2xl
        border border-purple-500/30
        shadow-[0_0_60px_rgba(139,92,246,0.3)]
        transition-all duration-300
        ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >

        {/* 🎥 Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
        >
          <source src="/videos/bg-video.mp4" type="video/mp4" />
        </video>

        {/* 🌑 Dark Overlay (NO BLUR now) */}
        <div className="absolute inset-0 bg-black/60 rounded-2xl" />

        {/* ✨ Neon Border Glow */}
        <div className="absolute inset-0 rounded-2xl border border-cyan-500/20 pointer-events-none shadow-[0_0_30px_rgba(0,255,255,0.2)]" />

        {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/70 hover:text-white transition z-20"
        >
          <X size={22} />
        </button>

        {/* 📄 Scrollable Content */}
        <div className="relative z-10 p-8 md:p-12 space-y-12 max-h-[90vh] overflow-y-auto text-white">
          
          {/* WHY CHOOSE US */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Why Choose Us?
            </h2>
            <p className="text-white/70">
              Rethinking how digital hubs and entertainment zones operate.
            </p>
          </div>

          {/* FEATURES */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Instant Booking",
                desc: "Skip the hassle—no need for calls or coordination. Reserve your station instantly.",
              },
              {
                title: "Live Availability",
                desc: "Check real-time status of spaces nearby and avoid wait times.",
              },
              {
                title: "Partner Dashboard",
                desc: "Seamless management of bookings, slots, and schedules.",
              },
              {
                title: "Built to Scale",
                desc: "Platform adapts as your business grows.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 p-6 bg-white/5 backdrop-blur-sm
                hover:border-purple-500/40
                hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]
                transition duration-300"
              >
                <h3 className="text-lg font-semibold mb-2 text-purple-400">
                  {item.title}
                </h3>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* MISSION */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-cyan-400">
              Our Mission
            </h3>
            <p className="text-white/70 leading-relaxed">
              We're redefining how people access high-end recreational and
              tech-enabled spaces with seamless booking and transparent systems.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 text-center gap-6 pt-8 border-t border-white/10">
            {[
              { number: "1+", label: "Partner Locations" },
              { number: "10+", label: "Verified Users" },
              { number: "99.9%", label: "System Uptime" },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-xl p-6 bg-white/5 border border-cyan-500/20
                shadow-[0_0_20px_rgba(0,255,255,0.15)]"
              >
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className="text-sm text-white/60 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
