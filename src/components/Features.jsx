import React from "react";
import { motion } from "framer-motion";
import featureUI from "../assets/feature-ui.png";
import featureBg from "../assets/BG Frame.png";

const features = [
  {
    title: "BOOKING STATUS",
    description: "Keep track of all bookings and their statuses in a single view",
    highlighted: true,
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
    <section className="bg-black text-white py-20 px-6 font-noodle">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left Side: Features List */}
        <div className="flex flex-col gap-5 w-full lg:w-[45%]">
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
            className="text-gray-400 text-center lg:text-left mb-4"
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
  className={`relative px-8 pt-8 pb-5 min-h-[130px]
    ${feature.highlighted 
      ? "bg-gradient-to-br from-[#1c2b1d] to-[#142414] border border-lime-500"
      : "bg-[#151515] border border-[#222]"}
  `}
  style={{
    clipPath:
      "polygon(60px 0%, 100% 0%, 100% calc(100% - 60px), calc(100% - 60px) 100%, 0% 100%, 0% 60px)",
  }}
>
 <div className="pl-8 mt-[-12px]">
  <h3 className="text-lg font-bold tracking-tight mb-2">{feature.title}</h3>
  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
</div>

</motion.div>



          ))}
        </div>

        {/* Right Side: Feature UI with background */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="w-full lg:w-[55%] relative flex items-center justify-center"
        >
          <div className="relative w-full max-w-[800px] -mt-24">
            {/* Background image (larger) */}
            <img
              src={featureBg}
              alt="Dotted Background"
              className="absolute -right-28 top-1/2 -translate-y-1/2 w-[420px] z-0 pointer-events-none"
            />

            {/* Feature UI image (enlarged) */}
            <img
              src={featureUI}
              alt="Feature UI"
              className="relative z-10 w-full h-auto object-contain lg:max-h-[820px]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
