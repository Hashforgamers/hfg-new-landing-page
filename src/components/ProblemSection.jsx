'use client';

import Image from 'next/image';
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const ProblemsSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: false,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const questionVariants = {
    hidden: { 
      opacity: 0, 
      clipPath: 'inset(0 100% 0 0)',
    },
    visible: {
      opacity: 1,
      clipPath: 'inset(0 0 0 0)',
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      x: -100,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.9,
        ease: 'easeOut',
      },
    },
  };

  const solutionVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: 'easeOut',
        delay: 0.4,
      },
    },
  };

  const bottomImageVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        delay: 0.6,
      },
    },
  };

  return (
    <div ref={ref} className='w-screen h-screen bg-black'>
      <div className='relative flex h-full flex-col items-center justify-center gap-8 px-[5vw] py-[8vh] lg:flex-row lg:gap-12'>
        <motion.div
          className='absolute right-[5vw] top-[14vh] hidden rounded-[28px] border border-white/10 bg-black/40 px-5 py-4 text-white/80 backdrop-blur-md lg:block'
          initial={{ opacity: 0, x: 80, rotate: 5 }}
          animate={inView ? { opacity: 1, x: 0, rotate: 2 } : { opacity: 0, x: 80, rotate: 5 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className='text-[10px] uppercase tracking-[0.4em] text-violet-300'>Conflict Board</p>
          <p className='mt-2 max-w-[220px] text-sm leading-6'>
            Each pain point hits like a mission dossier before the Hash solution lands.
          </p>
        </motion.div>
        
        {/* Left Side - Boy at Computer Image */}
        <motion.div 
          className='relative h-[500px] w-full max-w-[400px] lg:h-[700px] lg:max-w-[500px]'
          variants={imageVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <Image 
            src='/images/boy-computer.svg' 
            alt='Boy at gaming setup'
            fill
            className='object-contain lg:mx-[-100px]'
          />
        </motion.div>

        {/* Right Side - Text Content */}
        <div className='flex flex-col gap-8 max-w-2xl'>
          
          {/* Questions List */}
          <motion.div 
            className='flex flex-col gap-4'
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {['Can\'t find gaming cafes?', 'Can\'t trust new gaming gear?', 'Not got a single gaming identity?', 'Feel a lack of community?'].map((question, index) => (
              <motion.h2 
                key={index}
                className='text-white text-2xl md:text-3xl lg:text-2xl'
                variants={questionVariants}
              >
                {question}
              </motion.h2>
            ))}
          </motion.div>

          {/* Solution Text */}
          <motion.div 
            className='lg:mt-[-3vh]'
            variants={solutionVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <p className='text-[#16FF00] text-xl md:text-2xl lg:text-2xl font-normal mb-2'>
              your solution is,
            </p>
            <h1 className='text-[#16FF00] text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-bold tracking-wide'>
              HASH 4 GAMERS
            </h1>
          </motion.div>

          {/* Bottom Box with Gradient Border */}
          <motion.div 
            className='relative mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-2 backdrop-blur-sm'
            variants={bottomImageVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <motion.div
              initial={{ x: 80, scale: 1.06 }}
              animate={inView ? { x: 0, scale: 1 } : { x: 80, scale: 1.06 }}
              transition={{ duration: 0.95, ease: 'easeOut', delay: 0.15 }}
            >
              <Image src="/images/major-prblm.png" alt='prblm' width={560} height={560} sizes='(max-width: 768px) 90vw, 560px' />
            </motion.div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}

export default ProblemsSection;
