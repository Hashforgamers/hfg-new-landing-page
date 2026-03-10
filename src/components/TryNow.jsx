'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/common/Sidebar';
import { SITE_DOWNLOAD_URL } from '@/lib/site';
import Link from 'next/link';

const HeroSection = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      {/* Sidebar Component */}
      <AnimatePresence>
        {isSidebarOpen && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      <div className='relative min-h-screen w-screen overflow-hidden'>
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className='absolute top-0 left-0 w-full h-full object-cover -z-10'
        >
          <source src='/images/trynow.mp4' type='video/mp4' />
          Your browser does not support the video tag.
        </video>

        {/* Top Buttons */}
        <div className='relative z-20 flex justify-between px-[5vw] py-[48px] md:px-[6vw] md:py-[72px] lg:px-[8vw] lg:py-[88px]'>
          <button
            onClick={handleMenuClick}
            onMouseEnter={handleMenuHover}
            type='button'
            className='w-[40px] h-[40px] cursor-pointer relative'
          >
            <Image 
              width={40} 
              height={40} 
              src='/component/sideButton.svg' 
              alt="Side button" 
              className='w-full h-full pointer-events-none' 
            />
            <Menu className='absolute top-[12px] left-[12px] w-[16px] h-[16px] text-black pointer-events-none' />
          </button>
          
          <button>
            <Link href={SITE_DOWNLOAD_URL}> <Image width={100} height={100} sizes="100px" src='/component/button.svg' alt="Button" /> </Link>
          </button>
        </div>
        
        {/* Optional: Dark Overlay for better text visibility */}
        <div className='absolute inset-0 bg-black/10 z-0'></div>
        
        {/* Content on top of video */}
        <div className='relative z-10 flex h-full flex-col items-center justify-center px-[6vw] md:px-[8vw]'>
          <h1 className='mb-5 text-center text-3xl font-semibold leading-tight text-[#16FF00] md:text-3xl lg:mb-6 lg:text-4xl'>
            No begging for slots. No low-effort chaos. Just Hash.
          </h1>
          
          <p className='mb-8 max-w-3xl text-center text-lg text-white md:text-xl lg:mb-10 lg:text-2xl'>
            Open Hash, choose the right cafe, lock the right station,
            <br />
            secure the session, and enter like a premium player.
          </p>
          
          <button>
           <Link href={SITE_DOWNLOAD_URL}> <Image src="/images/trynow.svg" alt='trynow' width={150} height={160} sizes="150px" /> </Link>
          </button>
        </div>
      </div>
    </>
  );
}

export default HeroSection;
