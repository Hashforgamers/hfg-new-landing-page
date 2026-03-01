'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const BackgroundMusic = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    // Try autoplay immediately
    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Autoplay blocked, waiting for interaction...');
      }
    };

    playAudio();

    // Fallback: play on first interaction if blocked
    const handleFirstInteraction = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.log('Still blocked:', err);
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
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
      />

      {/* Controls */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-2">
        <button
          onClick={toggleMute}
          className="bg-gray-900/80 backdrop-blur-sm text-white p-3 rounded-full hover:bg-green-500 transition-all duration-300 shadow-lg"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <button
          onClick={togglePlay}
          className="bg-gray-900/80 backdrop-blur-sm text-white px-4 py-3 rounded-full hover:bg-green-500 transition-all duration-300 shadow-lg text-sm font-medium"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </>
  );
};

export default BackgroundMusic;