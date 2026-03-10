'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Volume2, VolumeX } from 'lucide-react';
import { SITE_LOGO } from '@/lib/site';

const TARGET_VOLUME = 0.35;
const EXIT_DURATION_MS = 550;

const BackgroundMusic = () => {
  const audioRef = useRef(null);
  const fadeFrameRef = useRef(0);
  const [hasEntered, setHasEntered] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(audio.muted || audio.volume === 0);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('volumechange', handleVolumeChange);
      cancelAnimationFrame(fadeFrameRef.current);
    };
  }, []);

  const fadeToTargetVolume = () => {
    const audio = audioRef.current;
    if (!audio) return;

    cancelAnimationFrame(fadeFrameRef.current);
    const step = () => {
      if (audio.muted) return;
      if (audio.volume >= TARGET_VOLUME) {
        audio.volume = TARGET_VOLUME;
        return;
      }

      audio.volume = Math.min(TARGET_VOLUME, audio.volume + 0.02);
      fadeFrameRef.current = requestAnimationFrame(step);
    };

    fadeFrameRef.current = requestAnimationFrame(step);
  };

  const enterHash = async () => {
    const audio = audioRef.current;
    if (!audio || isEntering) return;

    try {
      setIsEntering(true);
      audio.volume = 0;
      audio.muted = false;
      await audio.play();
      fadeToTargetVolume();
      setIsMuted(false);
      setIsPlaying(true);
      window.setTimeout(() => {
        setHasEntered(true);
        setIsEntering(false);
      }, EXIT_DURATION_MS);
    } catch {
      audio.muted = true;
      setIsMuted(true);
      setIsEntering(false);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      if (!audio.muted && audio.volume < TARGET_VOLUME) {
        audio.volume = TARGET_VOLUME;
      }
      setIsPlaying(true);
    } catch {}
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    if (!audio.muted && audio.volume < TARGET_VOLUME) {
      audio.volume = TARGET_VOLUME;
    }
    setIsMuted(audio.muted);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/metallica.mp3"
        loop
        preload="auto"
        playsInline
      />

      {!hasEntered && (
        <div
          className={`fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(22,255,0,0.16),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(116,77,224,0.18),transparent_26%),linear-gradient(180deg,rgba(3,3,3,0.82)_0%,rgba(0,0,0,0.96)_100%)] px-6 transition-all duration-500 ${
            isEntering ? 'scale-[1.03] opacity-0 blur-md' : 'scale-100 opacity-100 blur-0'
          }`}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[8%] top-[14%] h-40 w-40 rounded-full bg-[#16FF00]/10 blur-3xl" />
            <div className="absolute right-[10%] top-[18%] h-48 w-48 rounded-full bg-[#744DE0]/14 blur-3xl" />
            <div className="absolute bottom-[8%] left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#F97316]/10 blur-3xl" />
            <div className="absolute inset-y-0 left-[-18%] w-[28%] bg-white/5 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
          </div>

          <div
            className={`relative w-full max-w-3xl overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)] p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-500 md:p-12 ${
              isEntering ? 'translate-y-6 scale-[0.97]' : 'translate-y-0 scale-100'
            }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_30%)] opacity-80" />

            <div
              className={`relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-black/40 shadow-[0_0_60px_rgba(22,255,0,0.14)] transition-all duration-500 md:h-32 md:w-32 ${
                isEntering ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
              }`}
            >
              <div className="absolute inset-2 rounded-full border border-[#16FF00]/25" />
              <Image
                src={SITE_LOGO}
                alt="Hash For Gamers"
                width={96}
                height={96}
                sizes="96px"
                className="object-contain"
                priority
              />
            </div>

            <p className="relative mt-6 text-[11px] font-semibold uppercase tracking-[0.46em] text-[#16FF00]">
              Premium Access
            </p>
            <h2 className="relative mt-4 text-3xl font-black uppercase tracking-[0.12em] text-white md:text-6xl">
              Tap To Enter Hash
            </h2>
            <p className="relative mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
              Step into the premium gaming network with the soundtrack live. One tap opens the experience the way it is meant to be felt.
            </p>

            <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/66">
              <span className="rounded-full border border-white/10 bg-black/25 px-4 py-2 backdrop-blur-md">
                Premium bookings
              </span>
              <span className="rounded-full border border-white/10 bg-black/25 px-4 py-2 backdrop-blur-md">
                Elite cafes
              </span>
              <span className="rounded-full border border-white/10 bg-black/25 px-4 py-2 backdrop-blur-md">
                Sound on
              </span>
            </div>

            <button
              type="button"
              onClick={enterHash}
              className="group relative mt-9 inline-flex items-center rounded-full border border-[#16FF00]/40 bg-[#16FF00]/12 px-10 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#16FF00] shadow-[0_0_40px_rgba(22,255,0,0.12)] transition duration-300 hover:scale-[1.02] hover:bg-[#16FF00] hover:text-black disabled:pointer-events-none disabled:opacity-70"
              disabled={isEntering}
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              <span className="relative">{isEntering ? 'Entering...' : 'Enter With Sound'}</span>
            </button>
          </div>
        </div>
      )}

      {hasEntered && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-black/70 p-2 shadow-lg backdrop-blur-md">
          <button
            onClick={toggleMute}
            className="rounded-full bg-white/5 p-3 text-white transition-all duration-300 hover:bg-[#16FF00] hover:text-black"
            type="button"
            aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button
            onClick={togglePlay}
            className="rounded-full bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#16FF00] hover:text-black"
            type="button"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      )}
    </>
  );
};

export default BackgroundMusic;
