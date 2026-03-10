'use client';

import Image from 'next/image';
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

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
    <div ref={ref} className='w-screen h-screen bg-black flex items-center justify-center p-[4vh] lg:py-[5vh]'>
      <div className='relative w-full h-full rounded-3xl overflow-hidden' style={{ perspective: '1200px' }}>
        
        <Image 
          src='/images/retro-car.png' 
          alt='Retro car sunset background'
          fill
          className='object-cover'
          sizes='100vw'
        />

        <div className='absolute inset-0 flex flex-col items-start justify-between p-[5vw] md:p-[6vw] lg:p-[8vw]'>
          
          <div className='flex flex-col gap-2 max-w-3xl'>
            <motion.h1
              variants={headingVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{ transformStyle: 'preserve-3d' }}
              className='text-white text-2xl md:text-3xl lg:text-4xl xl:text-3xl font-medium leading-tight mt-[12vh] lg:mt-[10vh]'
            >
              Be part of India's gaming movement.
            </motion.h1>
            
            <motion.h2
              variants={subheadingVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{ transformStyle: 'preserve-3d' }}
              className='text-white text-2xl md:text-3xl lg:text-4xl xl:text-3xl font-medium'
            >
              Play. Earn. Compete.
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
             <Link href={`https://play.google.com/store/apps/details?id=com.hfg.hash`}> <Image src="/images/download2.png" width={200} height={220} sizes="200px" alt="Download button"/></Link>
            </motion.button>
          </div>

          <div className='flex justify-center w-full h-full'>
            <motion.div
              variants={sloganVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{ transformStyle: 'preserve-3d' }}
              className='flex justify-center mb-[-20vh] lg:mt-[24vh] mt-[20vh]'
            >
              <Image src="/images/slogan.svg" width={200} height={180} sizes="200px" alt="Slogan"/>
            </motion.div>
          </div>

        </div>

      </div>
      
    </div>


  );
}

export default IndiaGamingSection;
