"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

export default function GamingCafePage() {
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    device: "PC",
    date: "",
    time: "",
    hours: 1,
    extras: [],
    payment: "Cash",
  });

  const pricePerHour = {
    PC: 100,
    PS5: 200,
    Xbox: 180,
  };

  const extraPrices = {
    Headset: 50,
    "Extra Controller": 70,
    Snacks: 100,
  };

  const calculateTotal = () => {
    const base = form.hours * pricePerHour[form.device];
    const extraTotal = form.extras.reduce(
      (sum, item) => sum + extraPrices[item],
      0
    );
    return base + extraTotal;
  };

  return (
    <div className="min-h-screen text-white">

      {/* HERO SECTION WITH CYBER BG */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden">

        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/cyber-bg.jpeg"
            alt="Cyber Background"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">

          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold 
            bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 
            bg-clip-text text-transparent"
          >
            Ultimate Gaming Café Experience
          </motion.h1>

          <p className="mt-6 text-gray-300 max-w-2xl mx-auto">
            High-end PCs, ultra-fast internet and competitive gaming setup.
          </p>

          <button
            onClick={() => setIsOpen(true)}
            className="mt-8 px-8 py-3 bg-purple-600 rounded-2xl hover:bg-purple-500 transition"
          >
            Book Your Slot 🎮
          </button>

        </div>
      </section>

      {/* BOOKING MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-2xl w-[95%] max-w-lg relative text-white">

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center">
              Book Your Gaming Slot
            </h2>

            <input
              type="text"
              placeholder="Your Name"
              className="w-full mb-4 px-4 py-2 bg-black rounded-lg outline-none"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full mb-4 px-4 py-2 bg-black rounded-lg outline-none"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <select
              className="w-full mb-4 px-4 py-2 bg-black rounded-lg outline-none"
              onChange={(e) => setForm({ ...form, device: e.target.value })}
            >
              <option value="PC">PC (₹100/hr)</option>
              <option value="PS5">PS5 (₹200/hr)</option>
              <option value="Xbox">Xbox (₹180/hr)</option>
            </select>

            <input
              type="date"
              className="w-full mb-4 px-4 py-2 bg-black rounded-lg outline-none"
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <input
              type="time"
              className="w-full mb-4 px-4 py-2 bg-black rounded-lg outline-none"
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />

            <input
              type="number"
              min="1"
              placeholder="Number of Hours"
              className="w-full mb-4 px-4 py-2 bg-black rounded-lg outline-none"
              onChange={(e) =>
                setForm({ ...form, hours: Number(e.target.value) })
              }
            />

            <div className="mb-4">
              <p className="text-gray-400 mb-2">Extra Services</p>

              {["Headset", "Extra Controller", "Snacks"].map((item) => (
                <label key={item} className="block text-sm mb-1">
                  <input
                    type="checkbox"
                    className="mr-2"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({
                          ...form,
                          extras: [...form.extras, item],
                        });
                      } else {
                        setForm({
                          ...form,
                          extras: form.extras.filter((ex) => ex !== item),
                        });
                      }
                    }}
                  />
                  {item}
                </label>
              ))}
            </div>

            <select
              className="w-full mb-4 px-4 py-2 bg-black rounded-lg outline-none"
              onChange={(e) => setForm({ ...form, payment: e.target.value })}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>

            <div className="mb-4 text-right text-green-400 font-semibold">
              Total: ₹{calculateTotal()}
            </div>

            <button
              onClick={() => {
                alert("Booking Successful 🎮");
                setIsOpen(false);
              }}
              className="w-full bg-green-500 py-3 rounded-lg hover:bg-green-400 transition font-semibold"
            >
              Confirm Booking
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
