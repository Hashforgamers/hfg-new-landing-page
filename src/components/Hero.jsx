import React from "react";
import { motion } from "framer-motion";
import heroBg from "../assets/hero-bg.png";
import viewLocationsBtn from "../assets/view-locations-btn.png"; // ✅ Import image
import preRegisterBtn from "../assets/pre-register-btn.png";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative overflow-hidden text-white py-16 font-noodle"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-12 gap-12">
        {/* Left Content */}
        <motion.div
          className="max-w-xl w-full text-center md:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <motion.div
  className="inline-flex items-center gap-1 px-2 py-[1px] rounded-full border border-red-500 text-red-500 text-[10px] font-medium shadow-[0_0_0_2px_rgba(255,0,0,0.15)] w-max mx-auto md:mx-0 mb-1"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  <span className="text-[11px]">⭕</span>
  Live Soon
</motion.div>



          <motion.h1
            className="text-6xl uppercase tracking-tighter leading-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            CONQUER THE THRONE.
            <br />
            RULE THE GAME
          </motion.h1>

          <motion.p
            className="text-gray-400 mb-6 leading-relaxed text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Book Pro-Level Consoles. Crush Lobbies. Win Tournaments. This is
            where real gamers play.
          </motion.p>

          {/* Buttons */}
         <motion.div
  className="flex flex-col sm:flex-row gap-4 mb-10 justify-center md:justify-start"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5 }}
>
  {/* Pre Register Image Button */}
  <img
    src={preRegisterBtn}
    alt="Pre Register Now"
    className="w-36 sm:w-44 cursor-pointer hover:opacity-90 transition duration-300"
    onClick={() => {
      // e.g. navigate("/register");
    }}
  />

  {/* View Locations Image Button */}
 <img
  src={viewLocationsBtn}
  alt="View Locations"
  className="w-36 sm:w-44 h-10 mt-2 cursor-pointer hover:opacity-90 transition duration-300"
  onClick={() => {
   // window.scrollTo({ top: 1000, behavior: "smooth" });//
  }}
/>



</motion.div>

          {/* Stats */}
          <motion.div
            className="flex gap-10 justify-center md:justify-start text-green-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div>
              <p className="text-2xl">20+</p>
              <p className="text-sm text-white leading-relaxed">
                Gaming Stations
              </p>
            </div>
            <div>
              <p className="text-2xl">5k+</p>
              <p className="text-sm text-white leading-relaxed">
                Active Gamers
              </p>
            </div>
            <div>
              <p className="text-2xl">24x7</p>
              <p className="text-sm text-white leading-relaxed">Available</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Image */}
       <motion.div
  className="w-full md:w-[600px] lg:w-[720px]"
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.8, delay: 0.7 }}
>
  <img
    src="/character.png"
    alt="Gaming Character"
    className="w-full h-auto object-contain scale-110"
  />
</motion.div>

      </div>
    </section>
  );
};

export default Hero;
