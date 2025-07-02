import React from "react";
import { motion } from "framer-motion";
import featureUI from "../assets/feature-ui.JPG";
import featureBg from "../assets/BG Frame.png";
import featuresBoxes from "../assets/features-boxes.png";

const Features = () => {
  return (
    <section id="features" className="bg-black text-white py-20 px-6 md:px-12 font-noodle">
      <div className="w-full max-w-screen-2xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <h2 className="text-4xl sm:text-5xl uppercase tracking-tight mb-4">
            FEATURES
          </h2>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          </p>
        </motion.div>

        {/* Feature Layout */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Features Box Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:flex-[0.45] flex justify-center"
          >
            <img
              src={featuresBoxes}
              alt="Features Boxes"
              className="w-[75%] md:w-[70%] h-auto object-contain"
            />
          </motion.div>

          {/* Right: Feature UI with background */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:flex-[0.55] relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[800px] mt-4 lg:mt-12">
              {/* Background Image */}
              <img
                src={featureBg}
                alt="Dotted Background"
                className="absolute right-6 md:right-12 lg:right-20 top-[45%] -translate-y-1/2 w-[320px] z-0 pointer-events-none"
              />

              {/* Feature UI Image */}
              <img
                src={featureUI}
                alt="Feature UI"
                className="relative z-10 w-[80%] md:w-[70%] h-auto object-contain max-h-[750px] lg:max-h-[850px] translate-x-2 md:translate-x-4 lg:translate-x-6"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
