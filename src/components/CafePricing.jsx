import React from "react";
import { motion } from "framer-motion";

const pricingItems = [
  {
    label: "₹100 – ₹300/HR",
    title: "CONSOLE HOURLY RATE",
    description:
      "Rates may vary based on location, console type, and café offerings.",
    labelColor: "text-green-500",
  },
  {
    label: "CUSTOM CAFÉ PACKAGES",
    title: "MEMBERSHIP DEALS",
    description:
      "Unlock discounts, perks, and exclusive access directly from your chosen café.",
    labelColor: "text-green-500",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.5, ease: "easeOut" },
  }),
};

const CafePricing = () => {
  return (
    <section className="bg-[#060606] text-white py-20 px-6">
      <div className="text-center mb-14">
        <h2 className="text-4xl font-extrabold font-bebas tracking-wide uppercase">
          Transparent, Café-Based Pricing
        </h2>
        <p className="text-gray-400 mt-3 max-w-xl mx-auto">
          We believe in fair play, pricing is set by each gaming café, so you
          pay exactly what’s listed. No hidden fees.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 max-w-6xl mx-auto">
        {pricingItems.map((item, index) => (
          <motion.div
            key={index}
            className="bg-[#1f2e1f] p-6 md:p-8 w-full md:w-1/2 clip-corner"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={index}
            variants={cardVariants}
          >
            <p className={`text-sm font-bold uppercase ${item.labelColor}`}>
              {item.label}
            </p>
            <h3 className="text-lg font-extrabold uppercase mt-2 mb-3 tracking-wider">
              {item.title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CafePricing;
