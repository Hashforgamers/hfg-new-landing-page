import React, { useState } from "react";
import { motion } from "framer-motion";
import heroBg from "../assets/hero-bg.png";
import viewLocationsBtn from "../assets/view-locations-btn.png";
import preRegisterBtn from "../assets/pre-register-btn.png";
import ViewLocationModal from "./ViewLocationModal";
import PreRegisterModal from "./PreRegisterModal";

const Hero = () => {
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [preRegisterOpen, setPreRegisterOpen] = useState(false);

  return (
    <section
      id="hero"
      className="relative overflow-hidden text-white py-16 lg:py-24 font-noodle min-h-screen"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-12 gap-12">
        {/* Left Content */}
        <motion.div
          className="w-full max-w-xl text-center md:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
         <motion.div
  className="inline-flex items-center gap-1 px-2 py-[1px] rounded-full border border-red-500 text-red-500 text-[10px] font-medium w-max mx-auto md:mx-0 mb-1 -mt-2"
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
  <span className="text-[11px]">⭕</span>
  Live Soon
</motion.div>


          <motion.h1
  className="ml-2 sm:ml-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-tight mb-4"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
>
  CONQUER THE THRONE.
  <br />
  RULE THE GAME
</motion.h1>


          <motion.p
            className="text-gray-400 mb-6 leading-relaxed text-base sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Book Pro-Level Consoles. Crush Lobbies. Win Tournaments. This is
            where real gamers play.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 mb-10 justify-center md:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <img
              src={preRegisterBtn}
              alt="Pre Register Now"
              className="w-32 sm:w-40 md:w-44 cursor-pointer hover:opacity-90 transition duration-300"
              onClick={() => setPreRegisterOpen(true)}
            />

            <img
              src={viewLocationsBtn}
              alt="View Locations"
              className="w-32 sm:w-40 md:w-44 h-10 cursor-pointer hover:opacity-90 transition duration-300"
              onClick={() => setLocationModalOpen(true)}
            />
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex flex-row justify-center sm:justify-start gap-4 overflow-x-auto no-scrollbar text-green-400 text-center sm:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-[110px] shrink-0">
              <p className="text-2xl">20+</p>
              <p className="text-sm text-white leading-relaxed">Gaming Stations</p>
            </div>
            <div className="w-[110px] shrink-0">
              <p className="text-2xl">5k+</p>
              <p className="text-sm text-white leading-relaxed">Active Gamers</p>
            </div>
            <div className="w-[110px] shrink-0">
              <p className="text-2xl">24x7</p>
              <p className="text-sm text-white leading-relaxed">Available</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right-side Character Image */}
        <motion.div
          className="w-full md:w-[480px] lg:w-[600px] px-4 md:px-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <img
            src="/character.png"
            alt="Gaming Character"
            className="w-full h-auto max-w-[90%] md:max-w-full object-contain scale-105"
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
