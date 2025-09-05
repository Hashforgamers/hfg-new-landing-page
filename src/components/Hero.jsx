import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

import viewLocationsBtn from "../assets/view-locations-btn.png";


import ViewLocationModal from "./ViewLocationModal";
import PreRegisterModal from "./PreRegisterModal";

const Hero = () => {
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [preRegisterOpen, setPreRegisterOpen] = useState(false);

  const sendEvent = (eventName) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, {
        event_category: "Hero Section",
        event_label: eventName,
      });
      console.log(`✅ GA: ${eventName} event sent`);
    }
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("trackCustom", eventName);
      console.log(`✅ Meta Pixel: ${eventName} event sent`);
    }
  };

  const openPreRegisterModal = () => {
    setPreRegisterOpen(true);
    sendEvent("PreRegisterClick");
  };

  useEffect(() => {
    if (preRegisterOpen) sendEvent("PreRegisterModalOpen");
  }, [preRegisterOpen]);

  const openViewLocationsModal = () => {
    setLocationModalOpen(true);
    sendEvent("ViewLocationsClick");
  };

  useEffect(() => {
    if (locationModalOpen) sendEvent("ViewLocationsModalOpen");
  }, [locationModalOpen]);

  return (
    <section
      id="hero"
      className="relative overflow-hidden text-white py-16 lg:py-24 font-noodle min-h-screen"
    >
      {/* Hero Background */}
      <picture className="absolute inset-0 -z-10">
        <source srcSet="/hero-bg.avif" type="image/avif" />
        <source srcSet="/hero-bg.webp" type="image/webp" />
        <img
          src="/hero-bg.png"
          alt="Hero Background"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </picture>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row items-stretch justify-between px-6 md:px-12 gap-12">
        {/* Left */}
        <div className="px-6 sm:px-10 md:px-16 lg:px-24 py-10 sm:py-16 flex-1">
          <motion.div
            className="w-full max-w-xl -ml-1 sm:-ml-2 text-center md:text-left h-full flex flex-col justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <motion.div
              className="inline-flex items-center gap-1 px-2 py-[1px] rounded-full border border-red-500 text-red-500 text-[10px] font-medium w-max mx-auto md:ml-4 mb-3 -mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: [1, 0.6, 1],
                filter: [
                  "drop-shadow(0 0 6px #ff0000) drop-shadow(0 0 12px #ff0000)",
                  "drop-shadow(0 0 2px #ff0000)",
                  "drop-shadow(0 0 6px #ff0000) drop-shadow(0 0 12px #ff0000)",
                ],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            >
              <span className="text-[11px]">⭕</span> Live Now
            </motion.div>

            <motion.h1
              className="font-noodle ml-2 sm:ml-4 text-5xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-tighter leading-tight mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Built for Cafes
              <br />
              <span className="text-orange-500">Made</span> for{" "}
              <span className="text-green-600">Gamers</span>
            </motion.h1>

            <motion.p
              className="text-gray-400 mb-6 leading-relaxed text-base sm:text-lg ml-2 sm:ml-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Book Pro-Level Consoles. Crush Lobbies. Win Tournaments. This is
              where real gamers play.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4 mb-10 justify-center md:justify-start ml-2 sm:ml-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >

            <button
              onClick={openPreRegisterModal}
              className="w-36 sm:w-44 md:w-48 h-10
                         bg-[#096f00] text-white font-semibold text-lg 
                         flex items-center justify-center
                         cursor-pointer hover:opacity-90 
                         transition duration-300"
             style={{
                clipPath: "polygon(8% 0, 0% 40%, 0 100%, 92% 100%, 100% 60%, 100% 0)"
              }}
            >
              Download Now
            </button>

              <img
                src={viewLocationsBtn}
                alt="View Locations"
                className="w-32 sm:w-40 md:w-44 h-10 cursor-pointer hover:opacity-90 transition duration-300"
                onClick={openViewLocationsModal}
              />
            </motion.div>

            <motion.div
              className="flex flex-row justify-center sm:justify-start gap-4 overflow-x-auto no-scrollbar text-green-400 text-center sm:text-left ml-2 sm:ml-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="w-[110px] shrink-0">
                <p className="text-2xl">21+</p>
                <p className="text-sm text-white leading-relaxed">Gaming Cafes</p>
              </div>
              <div className="w-[110px] shrink-0">
                <p className="text-2xl">1000+</p>
                <p className="text-sm text-white leading-relaxed">Downloads</p>
              </div>
              <div className="w-[110px] shrink-0">
                <p className="text-2xl">24x7</p>
                <p className="text-sm text-white leading-relaxed">Available</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right-side Character Image */}
        <motion.div
          className="w-full md:w-[480px] lg:w-[600px] px-4 md:px-0 flex-1 flex items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <img
            src="https://res.cloudinary.com/dxjjigepf/image/upload/v1756064604/Hero_Img_ftjneu.png"
            alt="Gaming Character"
            className="w-full h-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
      </div>

      {/* Modals */}
      <PreRegisterModal
        isOpen={preRegisterOpen}
        onClose={() => setPreRegisterOpen(false)}
      />
      <ViewLocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </section>
  );
};

export default Hero;
