"use client";

import { useState } from "react";

export default function ListYourCafePage() {
  const [formData, setFormData] = useState({
    cafeName: "",
    state: "",
    city: "",
    ownerName: "",
    contact: "",
    email: "",
  });

  const states = {
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
    Delhi: ["New Delhi", "Dwarka", "Rohini"],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "state") {
      setFormData({
        ...formData,
        state: value,
        city: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/gaming-bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Form Container */}
      <div className="relative z-10 w-[95%] max-w-xl bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 text-white">
        <h2 className="text-3xl font-bold text-center mb-6">
          List Your Cafe With Us
        </h2>

        <form
          action="https://formsubmit.co/support@hashforgamers.com"
          method="POST"
          className="space-y-4"
        >
          {/* Hidden Fields */}
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_subject" value="New Cafe Listing 🚀" />
          <input type="hidden" name="_template" value="table" />

          {/* Cafe Name */}
          <div>
            <label className="block text-sm mb-1">Cafe Details</label>
            <input
              type="text"
              name="cafeName"
              placeholder="Enter the complete name"
              value={formData.cafeName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm mb-1">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select State</option>
              {Object.keys(states).map((state) => (
                <option key={state} value={state} className="text-black">
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm mb-1">City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              disabled={!formData.state}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select City</option>
              {formData.state &&
                states[formData.state].map((city) => (
                  <option key={city} value={city} className="text-black">
                    {city}
                  </option>
                ))}
            </select>
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-sm mb-1">Owner Details</label>
            <input
              type="text"
              name="ownerName"
              placeholder="Enter full name"
              value={formData.ownerName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Contact */}
          <div>
            <input
              type="tel"
              name="contact"
              placeholder="Contact number"
              value={formData.contact}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Enter your email id"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 transition font-semibold"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
