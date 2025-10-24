import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PreRegisterModal({ isOpen, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) setIsVisible(true);
  }, [isOpen]);

  // Fire Meta Pixel event when modal opens
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.fbq) {
      window.fbq("trackCustom", "PreRegisterModalOpen");
      console.log("✅ Meta Pixel: PreRegisterModalOpen event sent");
    }
  }, [isOpen]);

  const closeModal = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-3xl p-6 sm:p-8 text-white font-noodle max-h-[90vh] overflow-y-auto bg-[#64BD55]/10 backdrop-blur-lg deep-cut"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-3xl"
            >
              ×
            </button>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl uppercase text-center mb-6 tracking-wider">
              Download Our App
            </h2>

            {/* Store Links */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {/* Google Play Link */}
              <a
                href="https://play.google.com/store/apps/details?id=com.hfg.hash"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
                onClick={() => {
                  if (typeof window !== "undefined" && window.fbq) {
                    window.fbq("trackCustom", "PreRegisterPlayStoreClick");
                    console.log("✅ Meta Pixel: PreRegisterPlayStoreClick event sent");
                  }
                }}
              >
                <img
                  src="/playstore-badge.png"
                  alt="Get it on Google Play"
                  className="w-48 sm:w-56 hover:opacity-90 transition"
                />
              </a>

              {/* App Store Link */}
              <a
                href="https://onelink.to/85rrgg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
                onClick={() => {
                  if (typeof window !== "undefined" && window.fbq) {
                    window.fbq("trackCustom", "PreRegisterAppStoreClick");
                    console.log("✅ Meta Pixel: PreRegisterAppStoreClick event sent");
                  }
                }}
              >
                <img
                  src="appstore-badge.png" // 👈 save your uploaded image as "public/appstore-badge.png"
                  alt="Download on the App Store"
                  className="w-48 sm:w-56 hover:opacity-90 transition"
                />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
