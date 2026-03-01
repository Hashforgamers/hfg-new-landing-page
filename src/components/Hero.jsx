'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/common/Sidebar';

import Link from 'next/link';

const HeroSection = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const hashForText = "HASH FOR".split('');
  const gamersText = "GAMERS".split('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0, rotateX: 90, y: 20 },
    visible: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        delay: 0.2,
      },
    },
  };

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSidebarOpen(true);
  };

  return (
    <>
      {/* Sidebar Component */}
      <AnimatePresence>
        {isSidebarOpen && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      <div className='w-screen h-screen bg-black flex items-center justify-center p-[2vh] md:p-[2.5vh] lg:p-[3vh]'>
        {/* Main Container with padding */}
        <div className='relative w-full h-full'>
          
          {/* Background Image */}
          <div className='relative w-full h-full overflow-hidden rounded-2xl lg:rounded-3xl'>
            <Image 
              src='/images/hero-final.png' 
              alt='Hero background'
              fill
              className='object-cover opacity-80'
              priority
            />
          </div>

          {/* Top Buttons - Responsive positioning */}
          <div className='absolute top-[20px] left-[20px] right-[20px] md:top-[30px] md:left-[30px] md:right-[30px] lg:top-[40px] lg:left-[40px] lg:right-[40px] flex justify-between items-center z-40'>
            {/* Menu Button */}
            <button 
              onClick={handleMenuClick}
              className='w-[30px] h-[30px] md:w-[35px] md:h-[35px] lg:w-[40px] lg:h-[40px] cursor-pointer relative'
              type='button'
            >
              <Image 
                src='/component/sideButton.svg' 
                alt='Menu'
                fill
                className='object-contain pointer-events-none'
              />
              <Menu className='absolute top-[9px] left-[9px] md:top-[10px] md:left-[10px] lg:top-[12px] lg:left-[12px] w-[12px] h-[12px] md:w-[14px] md:h-[14px] lg:w-[16px] lg:h-[16px] text-black pointer-events-none'/>
            </button>

            {/* Download Button */}
            <Link href={`https://play.google.com/store/apps/details?id=com.hfg.hash`}>
              <button className='w-[70px] h-[70px] md:w-[85px] md:h-[85px] lg:w-[100px] lg:h-[100px] relative'>
                <Image 
                  src="/component/button.svg" 
                  alt='download' 
                  fill
                  className='object-contain'
                />
              </button>
            </Link>
          </div>

          {/* Purple Rectangle with Text - Responsive */}
          <div className='absolute inset-0 flex items-center justify-center z-20 pointer-events-none'>
            <div className='relative mt-[-10vh] md:mt-[-18vh] lg:mt-[-24vh]'>
              <div className='bg-[#744DE0] w-[93.2vw] md:w-[80vw] lg:w-[77vw] h-[62vh] md:h-[45vh] lg:h-[52vh] flex flex-col justify-center items-center px-4 md:px-6 lg:px-8'>
                
                {/* Subtitle */}
                <motion.p
                  className='text-white text-xl md:text-xl lg:text-2xl text-center mb-2 md:mb-3 lg:mb-4 mt-[-5vh] md:mt-[-8vh] lg:mt-[-14vh]'
                  variants={subtitleVariants}
                  initial="hidden"
                  animate="visible"
                >
                  pick your café, choose your game
                </motion.p>

                {/* HASH FOR - Responsive text */}
                <motion.div
                  className='text-white text-6xl md:text-6xl lg:text-8xl font-bold text-center flex flex-wrap justify-center'
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {hashForText.map((char, index) => (
                    <motion.span
                      key={`hash-for-${index}`}
                      variants={charVariants}
                      style={{
                        display: 'inline-block',
                        marginRight: char === ' ' ? '0.3em' : '0',
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.div>

                {/* GAMERS - Responsive text */}
                <motion.div
                  className='text-white text-6xl md:text-6xl lg:text-8xl font-bold text-center flex flex-wrap justify-center'
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {gamersText.map((char, index) => (
                    <motion.span
                      key={`gamers-${index}`}
                      variants={charVariants}
                      style={{
                        display: 'inline-block',
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Gaming Characters - Responsive sizing and positioning */}
          <div className='absolute bottom-[40px] md:bottom-[60px] lg:bottom-[80px] left-1/2 transform -translate-x-1/2 w-[420px] h-[650px] md:w-[500px] md:h-[250px] lg:w-[800px] lg:h-[400px] z-30 pointer-events-none'>
            <Image 
              src='/images/gaming-characters.png' 
              alt='Gaming characters'
              fill
              className='object-contain object-bottom'
            />
          </div>
          {/* Hash Logo above Scroll */}
<div className='hidden md:flex absolute bottom-[120px] lg:bottom-[160px] left-1/2 transform -translate-x-1/2 z-30 pointer-events-none'>
  <Image
    src='/images/hash-logo.png'
    alt='Hash For Gamers Logo'
    width={120}
    height={120}
    className='object-contain'
  />
</div>


         {/* Scroll Down Indicator */}
<div className='hidden md:flex absolute bottom-[30px] lg:bottom-[60px] left-1/2 transform -translate-x-1/2 z-30 flex-col items-center gap-3 pointer-events-none'>
  
  {/* Scroll Down Button Image */}
  <Image
    src='/images/Scroll Down.png'
    alt='Scroll Down'
    width={90}
    height={20}
    className='object-contain'
  />

  {/* Vector Arrow */}
  <div className="flex flex-col items-center gap-px animate-bounce">
  <Image
    src="/images/Vector 5.png"
    alt="Scroll Arrow 5"
    width={20}
    height={10}
  />
  <Image
    src="/images/Vector 4.png"
    alt="Scroll Arrow 4"
    width={20}
    height={10}
  />
  <Image
    src="/images/Vector 3.png"
    alt="Scroll Arrow 3"
    width={20}
    height={15}
  />
  </div>
</div>


        </div>
      </div>
    </>
  );
}

export default HeroSection;
