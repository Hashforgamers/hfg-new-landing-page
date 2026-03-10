'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const BackgroundMusic = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;
    let fadeFrame;
    audio.volume = 0;
    audio.muted = true;

    const fadeInAudio = () => {
      cancelAnimationFrame(fadeFrame);
      const step = () => {
        if (!audio.muted && audio.volume < 0.35) {
          audio.volume = Math.min(0.35, audio.volume + 0.03);
          fadeFrame = requestAnimationFrame(step);
        }
      };
      fadeFrame = requestAnimationFrame(step);
    };

    const attemptUnmute = () => {
      try {
        audio.muted = false;
        setIsMuted(false);
        fadeInAudio();
      } catch {}
    };

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        window.setTimeout(attemptUnmute, 120);
      } catch (error) {
        setIsPlaying(false);
      }
    };

    playAudio();

    const handleFirstInteraction = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        attemptUnmute();
      } catch {
        setIsPlaying(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && audio.paused) {
        playAudio();
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('pageshow', playAudio);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(fadeFrame);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('pageshow', playAudio);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        if (audio.muted) {
          audio.muted = false;
          setIsMuted(false);
        }
        if (audio.volume < 0.35) {
          audio.volume = 0.35;
        }
        setIsPlaying(true);
      } catch (err) {
        console.log('Play failed:', err);
      }
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  return (
    <>
      {/* Hidden Audio */}
      <audio
        ref={audioRef}
        src="/audio/metallica.mp3"
        loop
        preload="auto"
        autoPlay
        playsInline
        muted
      />

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
    </>
  );
};

export default BackgroundMusic;
