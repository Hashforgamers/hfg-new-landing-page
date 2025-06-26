import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    title: "BOOKING STATUS",
    description: "Keep track of all bookings and their statuses in a single view",
  },
  {
    title: "MANAGE DEVICES",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
  },
  {
    title: "PRICING MODEL",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
  },
  {
    title: "SCHEDULE & PRICE MANAGEMENT",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
  },
];

const Features = () => {
  return (
    <section className="bg-[#000000] text-white py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left Side: Features List */}
        <div className="flex flex-col gap-6 w-full lg:w-[45%]">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-center lg:text-left font-bebas uppercase tracking-wide"
          >
            FEATURES
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-400 text-center lg:text-left mb-6"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          </motion.p>

          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-[#1d2a1f] to-[#0f1c14] border border-lime-600 text-white p-5 relative clip-corner"
            >
              <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Right Side: UI Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative w-full lg:w-[55%] p-2"
        >
          {/* Neon Green Outline Frame */}
          <div
            className="absolute inset-0 border border-green-500 pointer-events-none z-0"
            style={{
              clipPath:
                "polygon(5% 0%, 100% 0%, 100% 90%, 95% 100%, 0% 100%, 0% 5%)",
            }}
          />

          {/* Neon Dot Corners */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>

          {/* Dotted Grid (Bottom Right) */}
          <div className="absolute bottom-0 right-0 w-[140px] h-[80px] bg-[radial-gradient(circle,_rgba(0,255,0,0.6)_1px,transparent_1px)] [background-size:12px_12px] opacity-60 z-0"></div>

          {/* UI Image */}
          <img
            src="../../public/feature-ui.png"
            alt="Feature UI"
            className="relative z-10 w-full h-auto rounded-lg shadow-xl"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
