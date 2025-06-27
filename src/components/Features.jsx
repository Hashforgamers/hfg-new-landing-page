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
    <section className="bg-[#000000] text-white py-20 px-6 font-noodle">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left Side: Features List */}
        <div className="flex flex-col gap-6 w-full lg:w-[45%]">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl text-center lg:text-left uppercase tracking-tight"
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
              className="bg-gradient-to-r from-[#1d2a1f] to-[#0f1c14] border border-lime-600 text-white py-5 relative clip-corner"
              style={{
                clipPath: "polygon(10% 0, 0% 10%, 0% 100%, 90% 100%, 100% 90%, 100% 0)",
              }}
            >
              <div className="pl-12 pr-5">
                <h3 className="text-lg mb-1 tracking-tight">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Side: UI Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="w-full lg:w-[55%]"
        >
          <img
            src="public/feature-ui.png"
            alt="Feature UI"
            className="w-full h-auto rounded-lg shadow-xl"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
