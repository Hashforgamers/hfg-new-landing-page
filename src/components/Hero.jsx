'use client';

import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/common/Sidebar';
import { SITE_DOWNLOAD_URL, SITE_LOGO } from '@/lib/site';

import Link from 'next/link';

const HeroSection = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const heroRef = useRef(null);
  
  const hashForText = "HASH FOR".split('');
  const gamersText = "GAMERS".split('');
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroPanelY = useTransform(scrollYProgress, [0, 1], [0, -72]);
  const heroPanelScale = useTransform(scrollYProgress, [0, 1], [1, 0.97]);
  const characterY = useTransform(scrollYProgress, [0, 1], [0, -56]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -42]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);
  const backgroundRotate = useTransform(scrollYProgress, [0, 1], [0, -1.2]);
  const panelRotateX = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const panelRotateY = useTransform(scrollYProgress, [0, 1], [0, -6]);
  const hashForDepthY = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const gamersDepthY = useTransform(scrollYProgress, [0, 1], [0, 18]);
  const hashForDepthX = useTransform(scrollYProgress, [0, 1], [0, -8]);
  const gamersDepthX = useTransform(scrollYProgress, [0, 1], [0, 10]);
  const characterScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.09]);
  const characterRotateY = useTransform(scrollYProgress, [0, 1], [0, -7]);
  const logoY = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const logoOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.78]);
  const scrollCueY = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -28]);

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

      <div
        ref={heroRef}
        className='flex h-screen w-screen items-center justify-center bg-black p-[2vh] md:p-[2.5vh] lg:p-[3vh]'
      >
        <div className='relative h-full w-full' style={{ perspective: '1800px' }}>
          
          {/* Background Image */}
          <div className='relative w-full h-full overflow-hidden rounded-2xl lg:rounded-3xl'>
            <motion.div
              className='absolute inset-0'
              style={{ y: backgroundY, scale: backgroundScale, rotate: backgroundRotate }}
            >
              <Image 
                src='/images/hero-final.png' 
                alt='Hero background'
                fill
                sizes="100vw"
                className='object-cover opacity-45'
                priority
              />
            </motion.div>
            <motion.div
              className='absolute inset-0 opacity-70'
              animate={{
                background: [
                  'radial-gradient(circle at 24% 24%, rgba(249,115,22,0.22), transparent 24%), radial-gradient(circle at 76% 22%, rgba(34,197,94,0.16), transparent 22%), linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.38) 100%)',
                  'radial-gradient(circle at 30% 18%, rgba(249,115,22,0.28), transparent 24%), radial-gradient(circle at 68% 28%, rgba(34,197,94,0.18), transparent 24%), linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.42) 100%)',
                  'radial-gradient(circle at 24% 24%, rgba(249,115,22,0.22), transparent 24%), radial-gradient(circle at 76% 22%, rgba(34,197,94,0.16), transparent 22%), linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.38) 100%)',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className='absolute inset-y-0 left-[-18%] w-[30%] bg-white/10 blur-3xl'
              animate={{ x: ['0%', '220%'] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }}
            />
          </div>

          <motion.div
            className='pointer-events-none absolute inset-0 z-10'
            style={{ y: glowY }}
          >
            <div className='absolute left-[8%] top-[18%] h-32 w-32 rounded-full bg-[#F97316]/18 blur-3xl md:h-44 md:w-44' />
            <div className='absolute right-[10%] top-[26%] h-28 w-28 rounded-full bg-[#16FF00]/14 blur-3xl md:h-40 md:w-40' />
            <div className='absolute bottom-[16%] left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[#744DE0]/24 blur-3xl md:h-52 md:w-52' />
          </motion.div>

          {/* Top Buttons - Responsive positioning */}
          <div className='absolute top-[20px] left-[20px] right-[20px] md:top-[30px] md:left-[30px] md:right-[30px] lg:top-[40px] lg:left-[40px] lg:right-[40px] flex justify-between items-center z-40'>
            {/* Menu Button */}
            <button 
              onClick={handleMenuClick}
              onMouseEnter={handleMenuHover}
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
            <Link href={SITE_DOWNLOAD_URL}>
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
          <div className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center'>
            <motion.div
              className='relative mt-[-8vh] md:mt-[-15vh] lg:mt-[-20vh]'
              style={{
                y: heroPanelY,
                scale: heroPanelScale,
                rotateX: panelRotateX,
                rotateY: panelRotateY,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className='relative flex h-[58vh] w-[92vw] flex-col items-center justify-center overflow-hidden border border-white/10 bg-[#744DE0]/92 px-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:h-[44vh] md:w-[80vw] md:px-6 lg:h-[50vh] lg:w-[76vw] lg:px-8'>
                <motion.div
                  className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent'
                  animate={{ x: ['-55%', '55%'] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className='absolute inset-0 opacity-45'
                  animate={{
                    background: [
                      'radial-gradient(circle at 50% 38%, rgba(255,255,255,0.18), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)',
                      'radial-gradient(circle at 56% 34%, rgba(255,255,255,0.22), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                      'radial-gradient(circle at 50% 38%, rgba(255,255,255,0.18), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)',
                    ],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                
                {/* Subtitle */}
                <motion.p
                  className='mt-[-2vh] mb-3 text-center text-lg text-white md:mb-3 md:text-xl lg:mb-5 lg:mt-[-8vh] lg:text-2xl'
                  variants={subtitleVariants}
                  initial="hidden"
                  animate="visible"
                >
                  the premium way to book your next grind
                </motion.p>

                {/* HASH FOR - Responsive text */}
                <motion.div
                  className='flex flex-wrap justify-center text-center text-5xl font-bold text-white md:text-6xl lg:text-8xl'
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{
                    y: hashForDepthY,
                    x: hashForDepthX,
                    transform: 'translateZ(42px)',
                    textShadow: '0 12px 40px rgba(0,0,0,0.28)',
                  }}
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
                  className='flex flex-wrap justify-center text-center text-5xl font-bold text-white md:text-6xl lg:text-8xl'
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{
                    y: gamersDepthY,
                    x: gamersDepthX,
                    transform: 'translateZ(84px)',
                    textShadow: '0 18px 50px rgba(0,0,0,0.34)',
                  }}
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

                <motion.div
                  className='absolute bottom-5 left-5 hidden gap-2 md:flex'
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className='rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/80 backdrop-blur-md'>
                    Premium bookings
                  </span>
                  <span className='rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/80 backdrop-blur-md'>
                    Elite cafes
                  </span>
                </motion.div>

              </div>
            </motion.div>
          </div>

          {/* Gaming Characters - Responsive sizing and positioning */}
          <motion.div
            className='absolute bottom-[40px] left-1/2 z-30 h-[650px] w-[420px] -translate-x-1/2 pointer-events-none md:bottom-[60px] md:h-[250px] md:w-[500px] lg:bottom-[80px] lg:h-[400px] lg:w-[800px]'
            style={{
              y: characterY,
              marginLeft: 5,
              scale: characterScale,
              rotateY: characterRotateY,
              transformStyle: 'preserve-3d',
            }}
          >
            <Image 
              src='/images/characters.png?v=20260311-0203' 
              alt='Gaming characters'
              fill
              sizes='(max-width: 768px) 420px, (max-width: 1200px) 500px, 800px'
              className='object-contain object-bottom opacity-100'
              style={{
                maskImage: 'linear-gradient(90deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.18) 10%, rgba(0,0,0,0.56) 20%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,1) 38%, rgba(0,0,0,1) 62%, rgba(0,0,0,0.9) 70%, rgba(0,0,0,0.56) 80%, rgba(0,0,0,0.18) 90%, rgba(0,0,0,0.01) 100%)',
                WebkitMaskImage: 'linear-gradient(90deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.18) 10%, rgba(0,0,0,0.56) 20%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,1) 38%, rgba(0,0,0,1) 62%, rgba(0,0,0,0.9) 70%, rgba(0,0,0,0.56) 80%, rgba(0,0,0,0.18) 90%, rgba(0,0,0,0.01) 100%)',
              }}
            />
            <div className='absolute inset-x-[16%] bottom-[4%] h-12 rounded-full bg-black/45 blur-3xl md:h-10 lg:h-16' />
          </motion.div>
          {/* Hash Logo above Scroll */}
<motion.div
  className='absolute bottom-[118px] left-1/2 z-30 hidden -translate-x-1/2 pointer-events-none md:flex lg:bottom-[160px]'
  style={{ y: logoY, opacity: logoOpacity }}
  animate={{ scale: [1, 1.04, 1] }}
  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
>
  <Image
    src={SITE_LOGO}
    alt='Hash For Gamers Logo'
    width={168}
    height={168}
    sizes='168px'
    className='object-contain'
  />
</motion.div>


         {/* Scroll Down Indicator */}
<motion.div
  className='absolute bottom-[26px] left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-3 pointer-events-none md:flex lg:bottom-[54px]'
  style={{ y: scrollCueY, opacity: logoOpacity }}
>
  
  {/* Scroll Down Button Image */}
  <Image
    src='/images/Scroll Down.png'
    alt='Scroll Down'
    width={90}
    height={20}
    sizes='90px'
    className='object-contain'
  />

  {/* Vector Arrow */}
  <div className="flex flex-col items-center gap-px animate-bounce">
  <Image
    src="/images/Vector 5.png"
    alt="Scroll Arrow 5"
    width={20}
    height={10}
    sizes='20px'
  />
  <Image
    src="/images/Vector 4.png"
    alt="Scroll Arrow 4"
    width={20}
    height={10}
    sizes='20px'
  />
  <Image
    src="/images/Vector 3.png"
    alt="Scroll Arrow 3"
    width={20}
    height={15}
    sizes='20px'
  />
  </div>
</motion.div>


        </div>
      </div>
    </>
  );
}

export default HeroSection;
