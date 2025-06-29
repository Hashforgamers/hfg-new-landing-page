import React from "react";
import { motion } from "framer-motion";
import featureUI from "../assets/feature-ui.png";
import featureBg from "../assets/BG Frame.png";
import featuresBoxes from "../assets/features-boxes.png"; // ⬅️ Combined feature boxes image

const Features = () => {
  return (
    <section className="bg-black text-white py-20 px-6 font-noodle">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Centered Title and Description */}
        <motion.div
  initial={{ opacity: 0, y: -20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  viewport={{ once: true }}
  className="text-center max-w-3xl mx-auto mb-10"
>
  <h2 className="text-5xl uppercase tracking-tight mb-4">
    FEATURES
  </h2>
  <p className="text-gray-400 text-lg leading-relaxed">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
  </p>
</motion.div>


        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left Side: Features Box Image */}
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
              className="w-[75%] md:w-[70%] h-auto object-contain"
            />
          </motion.div>

          {/* Right Side: Feature UI with background */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:w-[55%] relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[800px] mt-4 lg:mt-12">
              {/* Background image */}
             <img
  src={featureBg}
  alt="Dotted Background"
  className="absolute -right-20 md:-right-28 lg:-right-32 top-[45%] -translate-y-1/2 w-[320px] z-0 pointer-events-none"
/>



              {/* Feature UI image */}
              <img
                src={featureUI}
                alt="Feature UI"
                className="relative z-10 w-full h-auto object-contain max-h-[1000px] lg:max-h-[1100px]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
