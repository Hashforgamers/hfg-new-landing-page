"use client";

import Image from "next/image";
import { useState } from "react";

// Click-to-load so the game's download (tens of MB) never weighs on the page itself.
export default function GameEmbed({ src, poster, title }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[min(600px,calc((100svh-7rem)*3/4))] overflow-hidden rounded-2xl border border-white/10 bg-black">
      {playing ? (
        <iframe src={src} title={title} allow="fullscreen; autoplay; gamepad" className="absolute inset-0 h-full w-full" />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          data-track="game_play_click"
          data-track-placement="mumbai_surfer_embed"
          className="group absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <Image src={poster} alt="" fill sizes="600px" className="object-cover opacity-60 transition group-hover:opacity-80" />
          <span className="relative rounded-full bg-[#ff3d8b] px-10 py-4 font-display text-2xl uppercase tracking-wide text-white">
            Play now
          </span>
        </button>
      )}
    </div>
  );
}
