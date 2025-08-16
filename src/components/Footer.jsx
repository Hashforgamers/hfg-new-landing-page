import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTwitch, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import logo from "../assets/hash-logo.png";
import ContactUsModal from "./ContactUsModal"; // Import the modal component

const Footer = ({ onAboutClick, onTermsClick, onPrivacyClick }) => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  const socialLinks = [
    { icon: <FaTwitch />, name: "Twitch", href: "#" },
    { icon: <FaInstagram />, name: "Instagram", href: "https://www.instagram.com/hashforgamers/" },
    { icon: <FaTwitter />, name: "Twitter", href: "#" },
    { icon: <FaYoutube />, name: "YouTube", href: "https://www.youtube.com/@hashforgamers2519" },
  ];

  const sendMetaPixelEvent = (eventName, payload = {}) => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("trackCustom", eventName, payload);
      console.log(`✅ Meta Pixel: ${eventName} event sent`, payload);
    } else {
      console.warn("❌ fbq is undefined");
    }
  };

  const handleAboutClick = () => {
    sendMetaPixelEvent("FooterAboutClick");
    if (onAboutClick) onAboutClick();
  };

  const handlePrivacyClick = () => {
    sendMetaPixelEvent("FooterPrivacyPolicyClick");
    if (onPrivacyClick) onPrivacyClick();
  };

  const handleTermsClick = () => {
    sendMetaPixelEvent("FooterTermsClick");
    if (onTermsClick) onTermsClick();
  };

  const handleContactOpen = () => {
    setIsContactOpen(true);
    sendMetaPixelEvent("FooterContactOpen");
  };

  const handleContactClose = () => {
    setIsContactOpen(false);
    sendMetaPixelEvent("FooterContactClose");
  };

  const handleSocialClick = (name) => {
    sendMetaPixelEvent("FooterSocialClick", { platform: name });
  };

  const handleFAQClick = () => {
    sendMetaPixelEvent("FooterFAQClick");
    window.location.href = "/faq";
  };

  const handleSupportClick = () => {
    sendMetaPixelEvent("FooterSupportClick");
    window.location.href = "/support";
  };

  return (
    <>
      <footer className="bg-[#000000] text-gray-300 py-12 px-6 md:px-12">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <img src={logo} alt="Hash Logo" className="w-20 mb-4" />
            <p className="text-sm max-w-sm">
              Empowering gaming cafes with seamless booking, smart device management, and performance insights — all in one powerful dashboard.
            </p>
            <p className="text-xs mt-6 text-gray-500">© 2025 HashForGamers. All rights reserved.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative bg-[#101010] px-10 py-8 flex flex-col sm:flex-row gap-10 md:gap-20 rounded-tl-none rounded-bl-none rounded-tr-2xl rounded-br-[60px] border border-[#1f1f1f]"
          >
            <div className="flex flex-col gap-3 text-sm">
              <button onClick={handleAboutClick} className="text-left hover:text-white">
                About
              </button>
              <button onClick={handleContactOpen} className="text-left hover:text-white">
                Contact Us
              </button>
              <button onClick={handleFAQClick} className="text-left hover:text-white">
                FAQ
              </button>
              <button onClick={handleSupportClick} className="text-left hover:text-white">
                Support
              </button>
              <button onClick={handlePrivacyClick} className="text-left hover:text-white">
                Privacy Policy
              </button>
              <button onClick={handleTermsClick} className="text-left hover:text-white">
                Terms & Conditions
              </button>
            </div>

            <div className="hidden sm:block w-px bg-gray-600/40" />

            <motion.div
              className="flex flex-col gap-4 text-sm"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.2,
                  },
                },
              }}
            >
              {socialLinks.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  className="flex items-center gap-2 hover:text-white"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5 }}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick(item.name)}
                >
                  {item.icon} {item.name}
                </motion.a>
              ))}
            </motion.div>

            <div className="absolute bottom-0 right-0 w-24 h-24 bg-lime-400 opacity-30 blur-2xl rounded-full pointer-events-none" />
          </motion.div>
        </div>
      </footer>

      <ContactUsModal isOpen={isContactOpen} onClose={handleContactClose} />
    </>
  );
};

export default Footer;
