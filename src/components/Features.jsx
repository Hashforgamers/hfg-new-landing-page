import React, { useState } from "react";
import { motion } from "framer-motion";
import featureUI from "../assets/feature-ui.JPG";
import featureBg from "../assets/BG Frame.png";
import bookingStatusImage from "../assets/booking-status-preview.png";
import manageDevicesImage from "../assets/manage-devices-preview.png";
import pricingModelImage from "../assets/pricing-model-preview.png";

const Features = () => {
  const [modalImage, setModalImage] = useState(null);

  const featuresData = [
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

  const openModal = (img) => setModalImage(img);
  const closeModal = () => setModalImage(null);

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
          <p className="text-gray-400 text-lg leading-relaxed font-inter">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt
          </p>
        </motion.div>

        {/* Two Columns */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Features Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:w-[45%] flex flex-col gap-0 md:gap-8 p-0"
          >
            {featuresData.map((feature, idx) => (
              <div
                key={idx}
                className="relative w-full flex items-center justify-center p-0 m-0 border-0"
                style={{ minHeight: "150px" }}
              >
                <button
                  onClick={() => openModal(feature.image)}
                  className={`relative w-full h-[90px] md:h-[120px] lg:h-[150px] flex flex-col justify-start pl-[clamp(10%,24px,13%)] pr-[clamp(10%,24px,13%)] pt-6 bg-transparent group p-0 m-0 border-0 outline-none`}
                >
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 500 150"
                    className="absolute left-0 top-0 w-full h-full z-10 transition-colors duration-200"
                    style={{ pointerEvents: "none" }}
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
                      fill={idx === 0 ? "url(#featureBtnGradient)" : "#151c13"}
                      stroke={idx === 0 ? "#6A7A58" : "transparent"}
                      strokeWidth="2"
                      className="feature-polygon transition-colors duration-200"
                    />
                  </svg>

                  <div className="w-full flex flex-col items-start justify-start z-30 pointer-events-none pt-2 pl-2 sm:pl-4">
                    <span className="block font-noodle font-normal uppercase tracking-wide text-xs sm:text-sm md:text-lg lg:text-[1.7rem] leading-tight mb-1 text-white text-left select-none break-words whitespace-normal max-w-full">
                      {feature.title}
                    </span>
                    <span className="block font-inter font-normal text-[10px] sm:text-xs md:text-base lg:text-[1.1rem] leading-tight text-gray-300 text-left select-none break-words whitespace-normal max-w-full">
                      {feature.subtitle}
                    </span>
                  </div>

                  {idx === 0 && (
                    <style>{`
                      .group:hover svg .feature-polygon {
                        fill: url(#featureBtnGradient);
                        stroke: #6A7A58;
                      }
                    `}</style>
                  )}
                </button>
              </div>
            ))}
          </motion.div>

          {/* Right: Feature UI with Background */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:w-[55%] relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[1000px] mt-4 lg:mt-12 aspect-[4/3]">
              <img
                src={featureBg}
                alt="Dotted Background"
                className="absolute right-2 sm:right-6 top-[55%] -translate-y-1/2 w-[220px] sm:w-[260px] md:w-[280px] lg:w-[250px] z-0 pointer-events-none"
              />
              <img
                src={featureUI}
                alt="Feature UI"
                className="relative z-10 w-[75%] sm:w-[70%] md:w-[65%] lg:w-[70%] h-auto mx-auto object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal Popup */}
      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center px-2 sm:px-6">
          <div className="relative bg-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl w-full max-w-6xl max-h-[90vh] flex items-center justify-center">
            <button
              onClick={closeModal}
              className="absolute top-2 right-4 text-white text-3xl font-bold hover:text-red-400"
            >
              ×
            </button>
            <img
              src={modalImage}
              alt="Feature Preview"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Features;
