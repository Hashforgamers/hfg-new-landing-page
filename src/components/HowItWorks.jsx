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
    <section
      id="how-it-works"
      className="bg-[#000000] text-white py-20 px-6 md:px-12 font-noodle"
    >
      {/* Title */}
      <div className="max-w-screen-2xl mx-auto text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bebas tracking-wide uppercase mb-2">
          HOW IT WORKS
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
         Book. Play. Win. It’s that simple.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 max-w-screen-2xl mx-auto">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative bg-[#161c18bb] text-white p-4 md:p-5 flex flex-col md:flex-row gap-4 shadow-md hover:shadow-lime-500/30 transition-all duration-300 clip-corner w-full"
          >
            {/* Text Content */}
            <div className="flex-1 pl-4 md:pl-6">
              <h3 className="text-2xl font-shoulders uppercase tracking-wide mb-3 leading-tight">
                {step.title}
              </h3>
              <p className="text-gray-300 text-sm leading-normal">
                {step.description}
              </p>
            </div>

            {/* UI Image */}
            <img
              src={paymentImg}
              alt="Payment UI"
              className="w-full md:w-36 h-auto object-contain self-center"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
