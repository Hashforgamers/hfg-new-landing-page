'use client';

import Image from 'next/image';
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { SITE_DOWNLOAD_URL } from '@/lib/site';

const IndiaGamingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const headingVariants = {
    hidden: { opacity: 0, rotateX: 90, y: 50 },
    visible: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const subheadingVariants = {
    hidden: { opacity: 0, rotateX: -90, y: -50 },
    visible: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: { duration: 0.8, delay: 0.2, ease: 'easeOut' },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.5, rotateY: -90, z: -100 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      z: 0,
      transition: { duration: 0.8, delay: 0.4, ease: 'easeOut' },
    },
  };

  const sloganVariants = {
    hidden: { opacity: 0, scale: 0, rotateZ: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateZ: 0,
      transition: { duration: 0.8, delay: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div ref={ref} className='flex min-h-screen w-screen items-center justify-center bg-black p-[3vh] lg:py-[5vh]'>
      <div
        className='relative min-h-[88vh] w-full rounded-3xl overflow-hidden'
        style={{ perspective: '1200px' }}
      >
        
        <Image 
          src='/images/retro-car.jpg' 
          alt='Retro car sunset background'
          fill
          className='object-cover'
          sizes='100vw'
        />

        <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/55' />

        <div className='absolute inset-0 flex flex-col items-start justify-between p-[5vw] md:p-[6vw] lg:p-[8vw]'>
          
          <div className='flex max-w-3xl flex-col gap-2'>
            <motion.h1
              variants={headingVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{ transformStyle: 'preserve-3d' }}
              className='mt-[10vh] text-2xl font-medium leading-tight text-white md:text-3xl lg:mt-[8vh] lg:text-4xl xl:text-3xl'
            >
              Play where the standard is higher.
            </motion.h1>
            
            <motion.h2
              variants={subheadingVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{ transformStyle: 'preserve-3d' }}
              className='text-2xl font-medium text-white md:text-3xl lg:text-4xl xl:text-3xl'
            >
              Join Hash. Book better. Play premium.
            </motion.h2>
          </div>

          <div className='lg:mb-[-10vh]'>
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{ transformStyle: 'preserve-3d' }}
              className='lg:my-[10vh] my-[6vh]'
            >
             <Link href={SITE_DOWNLOAD_URL}> <Image src="/images/download2.png" width={200} height={220} sizes="200px" alt="Download button"/></Link>
            </motion.button>
          </div>

          <div className='flex h-full w-full items-end justify-center'>
            <motion.div
              variants={sloganVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{ transformStyle: 'preserve-3d' }}
              className='flex justify-center pb-6 md:pb-8 lg:pb-10'
            >
              <Image src="/images/slogan.svg" width={220} height={190} sizes="220px" alt="Slogan"/>
            </motion.div>
          </div>

        </div>

      </div>
      
    </div>


  );
}

export default IndiaGamingSection;
