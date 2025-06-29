import React from "react";
import { motion } from "framer-motion";
import paymentImg from "../assets/payment-ui.png";

const steps = [
  {
    title: "BOOK IN ADVANCE & PAY ONLINE",
    description:
      "Book your preferred gaming slot from anywhere, anytime, ensuring a seamless experience for gamers.",
  },
  {
    title: "WALK-IN & PAY IN CASH",
    description:
      "Whether it’s an individual session, team game, or LAN session, pay the cafe owner directly and settle with your gang later.",
  },
  {
    title: "SUBSCRIPTION MANAGEMENT",
    description:
      "Purchase, manage, and track your subscriptions, or passes with ease, making long-term gaming smoother.",
  },
  {
    title: "EFFORTLESS CANCELLATIONS",
    description:
      "Cancel bookings directly on the platform without needing to contact the gaming cafe, simplifying last-minute decisions.",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-[#000000] text-white py-20 px-6 font-noodle">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bebas tracking-wide uppercase mb-2">
          HOW IT WORKS
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative bg-[#1a2b1a]  text-white p-6 flex flex-col md:flex-row gap-6 shadow-md hover:shadow-lime-500/30 transition-all duration-300 clip-corner"
          >
            {/* Text Content */}
            <div className="flex-1 pl-6 md:pl-8">
              <h3 className="text-2xl font-bebas uppercase tracking-wide mb-4 leading-tight">
                {step.title}
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* UI Image */}
            <img
              src={paymentImg}
              alt="Payment UI"
              className="w-full md:w-52 h-auto object-contain self-center"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks; 