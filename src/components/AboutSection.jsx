'use client';

import Image from 'next/image';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/common/Sidebar';

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

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* MAIN SECTION */}
      <div ref={ref} className="relative w-screen h-screen overflow-hidden">

        {/* BACKGROUND VIDEO */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/about-bg.mp4" type="video/mp4" />
        </video>

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/70 z-10"></div>

        {/* TOP BAR */}
        <div className="relative z-20 flex justify-between py-[100px] px-[8vw]">
          <motion.button
            onClick={handleMenuClick}
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
            <Link href="https://play.google.com/store/apps/details?id=com.hfg.hash">
              <Image src="/component/button.svg" alt="Download" width={100} height={100} sizes="100px" />
            </Link>
          </motion.div>
        </div>

        {/* TEXT CONTENT */}
        <div className="relative z-20 mt-[1vh] px-[19vw]">

          <motion.h1
            className="text-5xl lg:text-6xl font-bold leading-tight"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.span
              className="text-[#16FF00] block drop-shadow-[0_0_12px_#16FF00]"
              variants={childVariants}
            >
              At Hash,
            </motion.span>
          </motion.h1>

          <motion.p
            className="lg:text-4xl text-xl font-bold leading-tight mt-8"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.span className="text-[#16FF00]" variants={childVariants}>
              booking your next{' '}
            </motion.span>
            <motion.span className="text-[#FFEB3B]" variants={childVariants}>
              gaming session{' '}
            </motion.span>
            <motion.span className="text-gray-400" variants={childVariants}>
              is as
            </motion.span>
            <br />

            <motion.span className="text-[#16FF00]" variants={childVariants}>
              smooth as a{' '}
            </motion.span>
            <motion.span className="text-[#FFEB3B]" variants={childVariants}>
              headshot flick.
            </motion.span>
            <motion.span className="text-gray-400" variants={childVariants}>
              {' '}Whether you're{' '}
            </motion.span>
            <br />

            <motion.span className="text-[#FFEB3B]" variants={childVariants}>
              grinding ranked
            </motion.span>
            <motion.span className="text-gray-400" variants={childVariants}>
              , partying with{' '}
            </motion.span>
            <br />

            <motion.span className="text-[#16FF00]" variants={childVariants}>
              friends
            </motion.span>
            <motion.span className="text-gray-400" variants={childVariants}>
              , or diving into a{' '}
            </motion.span>
            <motion.span className="text-[#FFEB3B]" variants={childVariants}>
              new release
            </motion.span>
            <motion.span className="text-gray-400" variants={childVariants}>
              , we've got your setup ready.
            </motion.span>
            <br />

            <motion.span className="text-gray-400" variants={childVariants}>
              PCs,{' '}
            </motion.span>
            <motion.span className="text-[#FFEB3B]" variants={childVariants}>
              consoles
            </motion.span>
            <motion.span className="text-gray-400" variants={childVariants}>
              ,{' '}
            </motion.span>
            <motion.span className="text-[#AA00FF]" variants={childVariants}>
              VR
            </motion.span>
            <motion.span className="text-gray-400" variants={childVariants}>
              , and{' '}
            </motion.span>
            <motion.span className="text-[#FFEB3B]" variants={childVariants}>
              snacks
            </motion.span>
            <motion.span className="text-[#16FF00]" variants={childVariants}>
              {' '}included.
            </motion.span>
          </motion.p>
        </div>
      </div>
    </>
  );
};

export default AboutSection;
