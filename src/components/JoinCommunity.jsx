import React from "react";
import { motion } from "framer-motion";
import bgImage from "../assets/BgImage.png";
import preRegisterBtn from "../assets/pre-register-btn2.png";

const JoinCommunity = ({ openPreRegister }) => {
  // Combined handler for Meta Pixel and Google Analytics
  const handlePreRegisterClick = () => {
    // Meta Pixel tracking
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("trackCustom", "JoinCommunityPreRegisterClick");
      console.log("✅ Meta Pixel: JoinCommunityPreRegisterClick event sent");
    }

    // Google Analytics tracking
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "join_community_preregister_click", {
        event_category: "engagement",
        event_label: "Join Community Section",
      });
      console.log("✅ Google Analytics: join_community_preregister_click event sent");
    }

    // Open modal
    openPreRegister();
  };

  return (
    <section
      className="relative text-white py-24 px-6 md:px-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a120a]/80 to-[#041e15]/80 z-0 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-shoulders uppercase"
        >
          Ready to Join the Elite Gaming Community?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-gray-300 mt-4 max-w-xl mx-auto text-base sm:text-lg"
        >
          Get exclusive access to premium gaming stations, tournaments, and a vibrant community of gamers.
        </motion.p>

        <div className="flex justify-center mt-8">
          <motion.img
            src={preRegisterBtn}
            alt="Pre Register Now"
            className="w-44 sm:w-52 h-auto cursor-pointer hover:opacity-90 transition duration-300"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            onClick={handlePreRegisterClick}
          />
        </div>
      </div>
    </section>
  );
};

export default JoinCommunity;
