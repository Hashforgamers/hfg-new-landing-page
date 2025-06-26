import React from "react";
import { motion } from "framer-motion";
import bgImage from "../assets/BgImage.png"; // ✅ Ensure correct path

const JoinCommunity = () => {
  return (
    <section
      className="relative text-white py-24 px-6 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* ✅ Dark overlay */}
      <div className="absolute inset-0 bg-black/70 z-0 pointer-events-none" />

      {/* ✅ Content with animations */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-extrabold font-bebas uppercase"
        >
          Ready to Join the Elite Gaming Community?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-gray-300 mt-4 max-w-xl mx-auto"
        >
          Get exclusive access to premium gaming stations, tournaments, and a vibrant community of gamers.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-3 rounded-md transition-all duration-300 clip-button"
        >
          Pre Register Now →
        </motion.button>
      </div>
    </section>
  );
};

export default JoinCommunity;
