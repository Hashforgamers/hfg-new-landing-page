import React from "react";
import { motion } from "framer-motion";
import featureUI from "../assets/feature-ui.JPG";
import featureBg from "../assets/BG Frame.png";
import featuresBoxes from "../assets/features-boxes.png";

const Features = () => {
  return (
    <section
      id="features"
      className="bg-black text-white py-20 px-4 sm:px-6 lg:px-8 font-noodle overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <h2 className="text-5xl uppercase tracking-tight mb-4">FEATURES</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt
          </p>
        </motion.div>

        {/* Two Columns */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Features Boxes */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:w-[45%] flex justify-center"
          >
            <img
              src={featuresBoxes}
              alt="Features Boxes"
              className="w-[85%] md:w-[70%] lg:w-[80%] max-w-full h-auto object-contain"
            />
          </motion.div>

          {/* Right: Feature UI with Background */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:w-[55%] relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[800px] mt-4 lg:mt-12 aspect-[4/3]">
              {/* Dotted Background Frame (scaled per screen) */}
              <img
                src={featureBg}
                alt="Dotted Background"
                className="absolute right-2 sm:right-6 top-[55%] -translate-y-1/2 w-[220px] sm:w-[260px] md:w-[280px] lg:w-[250px] z-0 pointer-events-none"
              />

              {/* Feature UI Image */}
              <img
                src={featureUI}
                alt="Feature UI"
                className="relative z-10 w-[75%] sm:w-[70%] md:w-[65%] lg:w-[70%] h-auto mx-auto object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
