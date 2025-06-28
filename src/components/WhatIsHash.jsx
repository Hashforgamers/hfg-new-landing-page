import React from "react";
import { Gamepad2, Trophy, Users, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

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
    <section className="bg-[#000000] text-white py-20 px-6 font-noodle">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-4xl mb-2 uppercase">WHAT IS HASH?</h2>
        <p className="text-gray-400 text-base">
          Hash is not just an app. It’s your gaming command center.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.2 }}
            viewport={{ once: true }}
            className="bg-[#0f1c14] p-6 border border-[#1a2a20] rounded-xl relative"
            style={{
              clipPath:
                "polygon(10% 0, 0% 40%, 0 100%, 90% 100%, 100% 50%, 100% 0)",
            }}
          >
            <div className="flex flex-col items-start gap-2 mb-2 pl-6 md:pl-8">
              <div>{feature.icon}</div>
              <h3 className="text-white text-base uppercase tracking-wider">
                {feature.title}
              </h3>
            </div>
            <p className="text-gray-400 text-base leading-relaxed pl-6 md:pl-8">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhatIsHash;
