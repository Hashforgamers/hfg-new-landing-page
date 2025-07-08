import React, { useState } from "react";
import { motion } from "framer-motion";
import featureUI from "../assets/feature-ui.JPG";
import featureBg from "../assets/BG Frame.png";
import bookingStatusImage from "../assets/booking-status-preview.png";
import manageDevicesImage from "../assets/manage-devices-preview.png";
import pricingModelImage from "../assets/pricing-model-preview.png";

const Features = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const featuresData = [
    {
      title: "DASHBOARD",
      subtitle: "A comprehensive overview of your gaming center's performance",
      image: featureUI,
    },
    {
      title: "BOOKING STATUS",
      subtitle: "Keep track of all bookings and their statuses in a single view",
      image: bookingStatusImage,
    },
    {
      title: "MANAGE DEVICES",
      subtitle: "View and manage your gaming consoles efficiently",
      image: manageDevicesImage,
    },
    {
      title: "PRICING MODEL",
      subtitle: "Configure dynamic slot pricing for all systems",
      image: pricingModelImage,
    },
  ];

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
          <h2 className="text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight mb-4">
            FEATURES
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed font-inter">
            Powerful tools built for gaming cafes, designed for performance and control.
          </p>
        </motion.div>

        {/* Two Columns */}
        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* Left: Feature Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:w-[45%] flex flex-col gap-6"
          >
            {featuresData.map((feature, idx) => (
              <div
                key={idx}
                className="relative w-full flex items-center justify-center"
              >
                <button
                  onClick={() =>
                    feature.title === "DASHBOARD"
                      ? setSelectedImage(null)
                      : setSelectedImage(feature.image)
                  }
                  className="relative w-full h-[100px] sm:h-[110px] md:h-[120px] lg:h-[130px] flex flex-col justify-start px-4 sm:px-6 pt-6 bg-transparent group outline-none"
                >
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 500 150"
                    className="absolute left-0 top-0 w-full h-full z-10 transition-colors duration-200"
                    style={{ pointerEvents: "none" }}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="featureBtnGradient"
                        x1="0"
                        y1="1"
                        x2="0"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#3F472D" />
                        <stop offset="40%" stopColor="#232a1e" />
                        <stop offset="100%" stopColor="#141414" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="40,0 500,0 500,110 460,150 0,150 0,40"
                      fill={
                        (selectedImage === null && feature.title === "DASHBOARD") ||
                        selectedImage === feature.image
                          ? "url(#featureBtnGradient)"
                          : "#151c13"
                      }
                      stroke={
                        (selectedImage === null && feature.title === "DASHBOARD") ||
                        selectedImage === feature.image
                          ? "#6A7A58"
                          : "transparent"
                      }
                      strokeWidth="2"
                    />
                  </svg>

                  <div className="w-full flex flex-col items-start justify-start z-30 pointer-events-none pt-2 pl-2 sm:pl-4">
                    <span className="block font-noodle font-normal uppercase tracking-wide text-sm sm:text-base md:text-lg lg:text-xl leading-tight mb-1 text-white text-left">
                      {feature.title}
                    </span>
                    <span className="block font-inter text-xs sm:text-sm md:text-base lg:text-base text-gray-300 text-left">
                      {feature.subtitle}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </motion.div>

          {/* Right: UI Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:w-[55%] relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[900px] aspect-[4/3]">
              {/* Background dots */}
              <img
                src={featureBg}
                alt="Dotted Background"
                className="absolute right-2 sm:right-6 top-[55%] -translate-y-1/2 w-[180px] sm:w-[220px] md:w-[240px] lg:w-[250px] z-0 pointer-events-none"
              />

              {/* Dashboard background - default */}
              {!selectedImage && (
                <img
                  src={featureUI}
                  alt="Dashboard UI"
                  className="relative z-10 w-[75%] sm:w-[70%] md:w-[65%] lg:w-[70%] h-auto mx-auto object-contain"
                />
              )}

              {/* Overlay preview */}
              {selectedImage && (
  <motion.div
    key={selectedImage}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="absolute top-0 left-0 w-full h-full z-20 bg-black/60 flex items-center justify-center rounded-lg"
    onClick={() => setSelectedImage(null)}
  >
    <img
      src={selectedImage}
      alt="Feature Preview"
      className="w-[90%] h-auto object-contain rounded-lg"
    />
    <button
      className="absolute top-3 right-4 text-white text-3xl font-bold hover:text-red-400"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedImage(null);
      }}
    >
      ×
    </button>
  </motion.div>
)}

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
