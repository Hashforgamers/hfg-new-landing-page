import React from "react";
import { motion } from "framer-motion";
import { Gift, Crown, Lock, Zap } from "lucide-react";

const features = [
  {
    title: "EARLY ACCESS TO THE APP",
    description: "Be the first to book arenas and dominate leaderboards.",
    icon: <Zap className="text-green-400 w-5 h-5" />,
  },
  {
    title: "EXCLUSIVE HASHDROP REWARDS",
    description: "Get limited-edition merch, coins, and tournament invites.",
    icon: <Gift className="text-green-400 w-5 h-5" />,
  },
  {
    title: "FOUNDING MEMBER BADGE",
    description: "Your tag will carry legacy. Forever.",
    icon: <Crown className="text-green-400 w-5 h-5" />,
  },
  {
    title: "PRIVATE DISCORD ACCESS",
    description: "Strategize with top gamers and influencers before launch.",
    icon: <Lock className="text-green-400 w-5 h-5" />,
  },
];

const Waitlist = () => {
  return (
    <section className="relative bg-[#000000] text-white py-20 px-6 overflow-hidden">

      {/* ✅ Animated background overlay */}
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

      {/* ✅ Main content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold mb-2">WHY JOIN THE WAITLIST?</h2>
        <p className="text-gray-400 mb-12">Power Comes to Those Who Wait.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="bg-[#121c16] border border-[#1e2a24] rounded-xl p-6 text-left relative transition duration-300 hover:shadow-[0_0_20px_#1fff96]"
              style={{
                clipPath:
                  "polygon(10% 0, 0% 40%, 0 100%, 90% 100%, 100% 50%, 100% 0)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                {feature.icon}
                <h3 className="text-white font-bold text-lg">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Waitlist;
