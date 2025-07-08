import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AboutModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center px-4 sm:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#64BD55]/10 to-[#64BD55]/10 backdrop-blur  p-6 sm:p-8 rounded-2xl clip-corner text-white about-scroll"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* ❌ Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-white hover:text-green-300"
            >
              <X size={22} />
            </button>

            {/* ✅ Content */}
            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl  text-[#ffffff] mb-2">
                Why Choose Us?
              </h2>
              <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
                Rethinking how digital hubs and entertainment zones operate.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {[
                {
                  title: "Instant Booking",
                  desc: "Skip the hassle—no need for calls or coordination. Reserve your station instantly and stay focused on what matters.",
                },
                {
                  title: "Live Availability",
                  desc: "Check real-time status of spaces nearby. Avoid wait times and plan your sessions with confidence.",
                },
                {
                  title: "Partner Dashboard",
                  desc: "Enable seamless management of bookings, slots, and schedules. Designed to streamline operations and empower hosts.",
                },
                {
                  title: "Built to Scale",
                  desc: "Whether starting small or expanding locations, our platform adapts to your growth and simplifies your operations.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-black border border-[#64BD55]/30 rounded-xl shadow-md"
                >
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-5 bg-black border border-[#64BD55]/30 rounded-xl">
              <h3 className="text-2xl font-normal text-white mb-4">Our Mission</h3>
              <p className="text-gray-300 text-sm mb-4">
                We're here to redefine how people engage with high-end recreational and tech-enabled spaces. With simplified access, our goal is to eliminate barriers and provide users with reliable tools for seamless experiences.
              </p>
              <p className="text-gray-300 text-sm mb-4">
                The platform is crafted to align users and space owners through intelligent scheduling, transparent operations, and real-time interaction. Whether you're managing one location or many, our tools make it easier to focus on what you do best.
              </p>
              <p className="text-gray-300 text-sm">
                For individuals, we offer a clear path to discover, book, and enjoy top-tier setups. For partners, we deliver robust systems to grow and manage their business digitally.
              </p>

              {/* Stats */}
              <div className="mt-6 grid sm:grid-cols-3 gap-4 text-center">
                <div className="bg-[#64BD55]/10 border border-[#64BD55]/30 py-4 rounded-lg">
                  <h4 className="text-2xl font-bold text-[#64BD55]">1+</h4>
                  <p className="text-sm text-white">Partner Locations</p>
                </div>
                <div className="bg-[#64BD55]/10 border border-[#64BD55]/30 py-4 rounded-lg">
                  <h4 className="text-2xl font-bold text-[#64BD55]">10+</h4>
                  <p className="text-sm text-white">Verified Users</p>
                </div>
                <div className="bg-[#64BD55]/10 border border-[#64BD55]/30 py-4 rounded-lg">
                  <h4 className="text-2xl font-bold text-[#64BD55]">99.9%</h4>
                  <p className="text-sm text-white">System Uptime</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AboutModal;
