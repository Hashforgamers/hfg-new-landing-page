import React from "react";
import { motion } from "framer-motion";
import { FaTwitch, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import logo from "../assets/hash-logo.png"; // ✅ Adjust path as needed

const Footer = () => {
  const socialLinks = [
    { icon: <FaTwitch />, name: "Twitch" },
    { icon: <FaInstagram />, name: "Instagram" },
    { icon: <FaTwitter />, name: "Twitter" },
    { icon: <FaYoutube />, name: "YouTube" },
  ];

  return (
    <footer className="bg-[#000000] text-gray-300 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        {/* ✅ Left: Logo + Info with fade-in */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex-1"
        >
          <img src={logo} alt="Hash Logo" className="w-20 mb-4" />
          <p className="text-sm max-w-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p className="text-xs mt-6 text-gray-500">
            © 2025 HashForGamers. All rights reserved.
          </p>
        </motion.div>

        {/* ✅ Right box with fade & slide-in */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative bg-[#101010] px-10 py-8 flex flex-col sm:flex-row gap-10 md:gap-20 rounded-tl-none rounded-bl-none rounded-tr-2xl rounded-br-[60px] border border-[#1f1f1f]"
        >
          {/* Link Group */}
          <div className="flex flex-col gap-3 text-sm">
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Help Center</a>
            <a href="#">Contact Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-gray-600/40" />

          {/* Social Links with staggered fade-in */}
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
                href="#"
                className="flex items-center gap-2 hover:text-white"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5 }}
              >
                {item.icon} {item.name}
              </motion.a>
            ))}
          </motion.div>

          {/* Neon Glow Blob */}
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-lime-400 opacity-30 blur-2xl rounded-full pointer-events-none" />
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
