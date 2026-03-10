'use client';

import Image from 'next/image';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/common/Sidebar';
import { SITE_DOWNLOAD_URL } from '@/lib/site';
import Link from 'next/link';

const AboutSection = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSidebarOpen(true);
  };

  const handleMenuHover = () => {
    setIsSidebarOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* MAIN SECTION */}
      <div ref={ref} className="relative min-h-screen w-screen overflow-hidden">

        {/* BACKGROUND VIDEO */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/about-bg.mp4" type="video/mp4" />
        </video>

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/70 z-10"></div>

        {/* TOP BAR */}
        <div className="relative z-20 flex justify-between px-[5vw] py-[52px] md:px-[8vw] md:py-[84px]">
          <motion.button
            onClick={handleMenuClick}
            onMouseEnter={handleMenuHover}
            variants={buttonVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            type="button"
            className="w-[40px] h-[40px] relative"
          >
            <Image src="/component/sideButton.svg" alt="Menu" fill sizes="40px" />
            <Menu className="absolute top-[12px] left-[12px] w-[16px] h-[16px] text-black" />
          </motion.button>

          <motion.div
            variants={buttonVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <Link href={SITE_DOWNLOAD_URL}>
              <Image src="/component/button.svg" alt="Download" width={100} height={100} sizes="100px" />
            </Link>
          </motion.div>
        </div>

        {/* TEXT CONTENT */}
        <div className="relative z-20 mt-[2vh] px-[6vw] md:px-[12vw] lg:mt-[4vh] lg:px-[18vw]">

          <motion.h1
            className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.span className="block text-[#16FF00] drop-shadow-[0_0_12px_#16FF00]" variants={childVariants}>
              At Hash,
            </motion.span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-4xl text-lg font-bold leading-tight md:text-2xl lg:mt-8 lg:text-4xl"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.span className="text-[#16FF00]" variants={childVariants}>
              booking your next{' '}
            </motion.span>
            <motion.span className="text-[#FFEB3B]" variants={childVariants}>
              premium session{' '}
            </motion.span>
            <motion.span className="text-gray-400" variants={childVariants}>
              feels sharp, clean, and high-status.
            </motion.span>
            <br />

            <motion.span className="text-[#16FF00]" variants={childVariants}>
              Find the right{' '}
            </motion.span>
            <motion.span className="text-[#FFEB3B]" variants={childVariants}>
              battleground,
            </motion.span>
            <motion.span className="text-gray-400" variants={childVariants}>
              {' '}lock the setup,
            </motion.span>
            <br />

            <motion.span className="text-[#FFEB3B]" variants={childVariants}>
              reserve your station,
            </motion.span>
            <motion.span className="text-gray-400" variants={childVariants}>
              and walk in like you own the lobby.
            </motion.span>
            <br />

            <motion.span className="text-[#16FF00]" variants={childVariants}>
              Hash turns discovery,
            </motion.span>
            <motion.span className="text-gray-400" variants={childVariants}>
              access,
            </motion.span>
            <motion.span className="text-[#FFEB3B]" variants={childVariants}>
              rewards,
            </motion.span>
            <motion.span className="text-gray-400" variants={childVariants}>
              and community
            </motion.span>
            <br />

            <motion.span className="text-gray-400" variants={childVariants}>
              into one
            </motion.span>
            <motion.span className="text-[#16FF00]" variants={childVariants}>
              {' '}premium gamer identity.
            </motion.span>
          </motion.p>
        </div>
      </div>
    </>
  );
};

export default AboutSection;
