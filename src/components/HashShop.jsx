'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { SITE_DOWNLOAD_URL } from '@/lib/site';

const HashShop = () => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.25, once: false });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Video autoplay failed:', error);
      });
    }
  }, []);

  return (
    <div ref={sectionRef} className='relative w-full min-h-screen overflow-hidden bg-black'>
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload='none'
        className='absolute top-0 left-0 w-full h-full object-cover z-0'
      >
        <source src='/videos/joystick.mp4' type='video/mp4' />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className='absolute inset-0 bg-black/40 z-10'></div>

      {/* Top Right Button - Responsive positioning */}
      <div className='absolute top-4 right-4 sm:top-8 sm:right-8 md:top-12 md:right-12 lg:top-16 lg:right-16 z-30'>
        <Link href={SITE_DOWNLOAD_URL}>
          <div className='relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 hover:scale-110 transition-transform duration-300'>
            <Image 
              src='/component/button.svg' 
              alt='Download app button' 
              fill
              sizes='(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, 112px'
              className='object-contain'
            />
          </div>
        </Link>
      </div>

      {/* Content Container */}
      <div className='relative z-20 min-h-screen flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 py-10 md:py-12 lg:py-16'>
        
        {/* Left Side - Text Content */}
        <motion.div
          className='flex w-full max-w-xl flex-col gap-4 sm:gap-6 md:gap-8 lg:mb-0 lg:w-auto'
          initial={{ opacity: 0, x: -80 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -80 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
        >
          {/* Heading */}
          <div className='relative w-40 h-20 sm:w-48 sm:h-24 md:w-56 md:h-28 lg:w-64 lg:h-32'>
            <Image 
              src='/images/HashShop.png' 
              alt='Hash Shop logo' 
              fill
              sizes='(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 224px, 256px'
              className='object-contain object-left'
            />
          </div>
          
          {/* Description Text */}
          <div className='relative w-40 h-20 sm:w-48 sm:h-24 md:w-56 md:h-28 lg:w-64 lg:h-32'>
            <Image 
              src='/images/bookingText.png' 
              alt='Booking description' 
              fill
              sizes='(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 224px, 256px'
              className='object-contain object-left'
            />
          </div>

          {/* Shop Now Button */}
          <Link href='/shop'>
            <div className='relative w-24 h-12 sm:w-28 sm:h-14 md:w-32 md:h-16 lg:w-36 lg:h-18 hover:scale-105 transition-transform duration-300 cursor-pointer'>
              <Image 
                src='/images/shopnow.svg' 
                alt='Shop now button' 
                fill
                sizes='(max-width: 640px) 96px, (max-width: 768px) 112px, (max-width: 1024px) 128px, 144px'
                className='object-contain object-left'
              />
            </div>
          </Link>
        </motion.div>

        {/* Right Side - Product Images (Energy Drinks) */}
        <div className='relative flex w-full flex-row items-end justify-center gap-2 sm:gap-4 md:gap-6 lg:w-auto lg:justify-end lg:gap-8'>
          <motion.div
            className='absolute -top-6 right-0 hidden rounded-[28px] border border-white/10 bg-black/40 px-5 py-4 text-white/80 backdrop-blur-md lg:block'
            initial={{ opacity: 0, x: 72, rotate: 6 }}
            animate={isInView ? { opacity: 1, x: 0, rotate: 2 } : { opacity: 0, x: 72, rotate: 6 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <p className='text-[10px] uppercase tracking-[0.4em] text-rose-300'>Loot Drop</p>
            <p className='mt-2 max-w-[200px] text-sm leading-6'>
              Premium brands expand through gear, ritual, and identity. Hash Gear is part of that world.
            </p>
          </motion.div>

          {/* First Drink (Orange Monster) */}
          <motion.div
            className='relative h-48 w-24 hover:scale-105 sm:h-64 sm:w-32 md:h-80 md:w-40 lg:h-96 lg:w-48 xl:h-[28rem] xl:w-56'
            initial={{ opacity: 0, y: 70, rotate: -8 }}
            animate={isInView ? { opacity: 1, y: 0, rotate: -4 } : { opacity: 0, y: 70, rotate: -8 }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: 0.15 }}
          >
            <Image 
              src='/images/hash-monster-orange.png' 
              alt='Hash Monster Orange Energy Drink'
              fill
              sizes='(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 224px'
              className='object-contain drop-shadow-2xl'
            />
          </motion.div>

          {/* Second Drink (Green X-Slash) - Center/Tallest */}
          <motion.div
            className='relative h-48 w-24 hover:scale-105 sm:h-64 sm:w-32 md:h-80 md:w-40 lg:h-96 lg:w-48 xl:h-[28rem] xl:w-56'
            initial={{ opacity: 0, y: 84, scale: 0.92 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 84, scale: 0.92 }}
            transition={{ duration: 0.85, ease: 'easeOut', delay: 0.25 }}
          >
            <Image 
              src='/images/hash-x-green.png' 
              alt='Hash X Green Energy Drink'
              fill
              sizes='(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 224px'
              className='object-contain drop-shadow-2xl'
            />
          </motion.div>

          {/* Third Drink (Orange Monster) */}
          <motion.div
            className='relative h-48 w-24 hover:scale-105 sm:h-64 sm:w-32 md:h-80 md:w-40 lg:h-96 lg:w-48 xl:h-[28rem] xl:w-56'
            initial={{ opacity: 0, y: 70, rotate: 8 }}
            animate={isInView ? { opacity: 1, y: 0, rotate: 4 } : { opacity: 0, y: 70, rotate: 8 }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: 0.35 }}
          >
            <Image 
              src='/images/hash-monster-orange.png' 
              alt='Hash Monster Orange Energy Drink'
              fill
              sizes='(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 224px'
              className='object-contain drop-shadow-2xl'
            />
          </motion.div>
        </div>

      </div>
    </div>
  );
}

export default HashShop;
