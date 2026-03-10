'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PartnerWithUsModal({ isOpen, onClose }) {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const states = {
    Maharashtra: [
      "Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad"
    ],
    Gujarat: [
      "Ahmedabad", "Surat", "Vadodara", "Rajkot"
    ],
    Karnataka: [
      "Bengaluru", "Mysore", "Hubli"
    ],
    Delhi: [
      "New Delhi", "Dwarka", "Rohini"
    ],
    Uttar_Pradesh: [
      "Lucknow", "Noida", "Kanpur", "Ghaziabad"
    ],
    Rajasthan: [
      "Jaipur", "Udaipur", "Jodhpur"
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      
      <div className="relative w-[95%] md:w-[70%] lg:w-[60%] h-[90vh] rounded-2xl overflow-hidden shadow-2xl">

        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/cyber-bg.mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative z-10 h-full overflow-y-auto p-8 text-white">

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 bg-white/10 hover:bg-red-500 p-2 rounded-full"
          >
            <X size={20} />
          </button>

          <h2 className="text-3xl md:text-4xl font-bold text-green-400 mb-6">
            Partner With Us
          </h2>

          <form className="space-y-6">

            <div>
              <label className="block mb-2">Business Name</label>
              <input
                type="text"
                placeholder="Enter business name"
                className="w-full p-3 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:border-green-400"
              />
            </div>

            <div>
              <label className="block mb-2">Business Type</label>
              <input
                type="text"
                placeholder="Cafe / Brand / Event Organizer"
                className="w-full p-3 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:border-green-400"
              />
            </div>

            {/* State Dropdown */}
            <div>
              <label className="block mb-2">State</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity('');
                }}
                className="w-full p-3 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:border-green-400"
              >
                <option value="">Select State</option>
                {Object.keys(states).map((state, index) => (
                  <option key={index} value={state}>
                    {state.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            {selectedState && (
              <div>
                <label className="block mb-2">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:border-green-400"
                >
                  <option value="">Select City</option>
                  {states[selectedState].map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block mb-2">Contact Person Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                className="w-full p-3 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:border-green-400"
              />
            </div>

            <div>
              <label className="block mb-2">Contact Number</label>
              <input
                type="tel"
                placeholder="Enter contact number"
                className="w-full p-3 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:border-green-400"
              />
            </div>

            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:border-green-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 transition-all p-3 rounded-lg font-semibold"
            >
              Submit Partnership Request
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
