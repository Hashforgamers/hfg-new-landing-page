import React from "react";
import { motion } from "framer-motion";
import heroBg from "../assets/hero-bg.png"; // ✅ Imported PNG background

const Hero = () => {
  return (
    <section
      className="relative overflow-hidden text-white py-16"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />



      {/* Outer Container */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-12 gap-12">
        
        {/* Left Content */}
        <motion.div
          className="max-w-xl w-full text-center md:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <motion.p
            className="text-red-500 mb-2 border border-red-500 rounded-border px-3 py-1 w-max text-sm mx-auto md:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            ⭕ Live Soon
          </motion.p>

          <motion.h1
            className="text-5xl font-extrabold leading-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            CONQUER THE THRONE.
            <br />
            RULE THE GAME
          </motion.h1>

          <motion.p
            className="text-gray-400 mb-6"
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
            <button
              className="bg-green-500 hover:bg-green-600 text-black font-semibold py-2 px-5 shadow-lg"
              style={{
                clipPath:
                  "polygon(10% 0, 0% 50%, 0 100%, 90% 100%, 100% 50%, 100% 0)",
              }}
            >
              Pre Register Now
            </button>
            <button
              className="border border-gray-500 hover:border-white py-2 px-5"
              style={{
                clipPath:
                  "polygon(10% 0, 0% 50%, 0 100%, 90% 100%, 100% 50%, 100% 0)",
              }}
            >
              View Locations
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex gap-10 justify-center md:justify-start text-green-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div>
              <p className="text-2xl font-bold">20+</p>
              <p className="text-sm text-white">Gaming Stations</p>
            </div>
            <div>
              <p className="text-2xl font-bold">5k+</p>
              <p className="text-sm text-white">Active Gamers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">24x7</p>
              <p className="text-sm text-white">Available</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Content - Image */}
        <motion.div
          className="w-full md:w-[400px] lg:w-[450px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <img
            src="/character.png"
            alt="Gaming Character"
            className="w-full h-auto object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
