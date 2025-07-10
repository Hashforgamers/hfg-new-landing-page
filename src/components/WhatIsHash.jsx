import React from "react";
import { Gamepad2, Trophy, Users, Smartphone } from "lucide-react";

const features = [
  {
    title: "BOOK NEXT-GEN CONSOLES",
    description: "Real-time bookings at your city’s top gaming cafes.",
    icon: <Gamepad2 className="text-green-400 w-6 h-6" />,
  },
  {
    title: "JOIN COMPETITIVE TOURNAMENTS",
    description: "Climb the ranks. Win real rewards. Build your legacy.",
    icon: <Trophy className="text-green-400 w-6 h-6" />,
  },
  {
    title: "SQUAD UP & CONNECT",
    description: "Your crew. Your arena. Your rules.",
    icon: <Users className="text-green-400 w-6 h-6" />,
  },
  {
    title: "ALL-IN-ONE GAMING APP",
    description: "One tap. Full control of your gaming journey.",
    icon: <Smartphone className="text-green-400 w-6 h-6" />,
  },
];

const WhatIsHash = () => {
  return (
    <section
      id="what-is-hash"
      className="bg-[#000000] text-white py-20 px-4 sm:px-6 md:px-12 font-noodle"
    >
      <div className="max-w-screen-2xl mx-auto text-center mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 uppercase">
          WHAT IS HASH?
        </h2>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          Hash is not just an app. It’s your gaming command center.
        </p>
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
  {features.map((feature, idx) => (
    <div
      key={idx}
      className="relative flex items-center justify-center px-2"
      style={{ minHeight: "160px" }}
    >
      <div className="relative w-full h-[160px] sm:h-[180px] md:h-[190px] lg:h-[200px] flex flex-col justify-start px-6 sm:px-8 pt-8 bg-transparent group outline-none">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 500 150"
          className="absolute left-0 top-0 w-full h-full z-10"
          preserveAspectRatio="none"
          style={{ pointerEvents: "none" }}
        >
          <polygon
            points="40,0 500,0 500,110 460,150 0,150 0,40"
            fill="#161c18bb"
            stroke="#1a2a20"
            strokeWidth="2"
          />
        </svg>
<div className="w-full flex flex-col items-start justify-start z-30 pointer-events-none pl-1 sm:pl-4 gap-5">
  <div className="mb-0">{feature.icon}</div>
  <div className="flex flex-col gap-1">
    <h2 className="block font-shoulders font-normal uppercase tracking-wide text-sm sm:text-base md:text-lg lg:text-3xl leading-tight text-white text-left">
      {feature.title}
    </h2>
    <span className="block font-inter text-xs sm:text-sm md:text-base lg:text-base text-gray-300 text-left leading-snug">
      {feature.description}
    </span>
  </div>
</div>

      </div>
    </div>
  ))}
</div>

    </section>
  );
};

export default WhatIsHash;
