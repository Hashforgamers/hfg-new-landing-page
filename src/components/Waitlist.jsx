import React from "react";
import { motion } from "framer-motion";
import { Zap, Gift, Crown, Lock } from "lucide-react";

const features = [
  {
    icon: <Zap className="text-[#64BD55] w-6 h-6" />,
    title: "EARLY ACCESS TO THE APP",
    description: "Be the first to book arenas and dominate leaderboards.",
  },
  {
    icon: <Gift className="text-[#64BD55] w-6 h-6" />,
    title: "EXCLUSIVE HASHDROP REWARDS",
    description: "Get limited-edition merch, coins, and tournament invites.",
  },
  {
    icon: <Crown className="text-[#64BD55] w-6 h-6" />,
    title: "FOUNDING MEMBER BADGE",
    description: "Your tag will carry legacy. Forever.",
  },
  {
    icon: <Lock className="text-[#64BD55] w-6 h-6" />,
    title: "PRIVATE DISCORD ACCESS",
    description: "Strategize with top gamers and influencers before launch.",
  },
];

const Waitlist = () => {
  // Fired once when section scrolls into view
  const handleSectionView = () => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("trackCustom", "WaitlistSectionView");
      console.log("✅ Meta Pixel: WaitlistSectionView event sent");
    }
  };

  // Fired when user hovers a feature
  const handleFeatureHover = (featureTitle) => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("trackCustom", "WaitlistFeatureHover", { feature: featureTitle });
      console.log(`✅ Meta Pixel: WaitlistFeatureHover event sent for ${featureTitle}`);
    }
  };

  // Optional: Fired when user clicks a feature card
  // You can make these clickable if desired, here is the handler:
  const handleFeatureClick = (featureTitle) => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("trackCustom", "WaitlistFeatureClick", { feature: featureTitle });
      console.log(`✅ Meta Pixel: WaitlistFeatureClick event sent for ${featureTitle}`);
    }
  };

  return (
    <section
      className="relative bg-black text-white py-20 px-4 sm:px-6 lg:px-8 font-noodle overflow-hidden"
      onViewportEnter={handleSectionView}
    >
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 z-0 bg-[url('/bg-lines.png')] bg-cover bg-center opacity-5 pointer-events-none"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl mb-3 tracking-tighter leading-tight">
          WHY JOIN THE WAITLIST?
        </h2>
        <p className="text-white/70 mb-10 text-sm sm:text-lg">
          Power Comes to Those Who Wait.
        </p>

        {/* Tightly spaced 2x2 Grid */}
        <div className="-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="relative w-[97%] mx-auto flex items-center justify-center cursor-pointer"
              style={{ minHeight: "170px" }}
              onMouseEnter={() => handleFeatureHover(feature.title)}
              onClick={() => handleFeatureClick(feature.title)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleFeatureClick(feature.title);
                }
              }}
              aria-label={`Feature: ${feature.title}`}
            >
              <div className="relative w-full h-[160px] sm:h-[170px] md:h-[180px] lg:h-[190px] flex flex-col justify-start px-6 sm:px-10 pt-8 bg-transparent group outline-none">
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
                    fill="#161c18bb" // dark forest green, 40% transparent
                    stroke="#1a2a20"
                    strokeWidth="2"
                  />
                </svg>

                <div className="w-full flex flex-col items-start justify-start z-30 pointer-events-none pl-1 sm:pl-4">
                  <div className="mb-3">{feature.icon}</div>
                  <h3 className="block font-shoulders font-normal uppercase tracking-wide text-[12px] sm:text-sm md:text-lg lg:text-[1.6rem] leading-tight mb-1 text-white text-left">
                    {feature.title}
                  </h3>
                  <span className="block font-inter text-[10px] sm:text-xs md:text-base lg:text-[1.1rem] text-gray-300 text-left leading-snug">
                    {feature.description}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Waitlist;
