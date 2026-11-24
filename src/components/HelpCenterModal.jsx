'use client';

import { X } from 'lucide-react';

export default function HelpCenterModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden shadow-2xl">

        {/* Background Image inside modal */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/contact-us.webp')",
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-purple-900/70" />

        {/* Content */}
        <div className="relative z-10 grid md:grid-cols-2 text-white">

          {/* Left Section */}
          <div className="p-10 border-r border-green-400/20 backdrop-blur-xl bg-black/40">
            <h2 className="text-4xl font-bold text-green-400 mb-6">
              Need Help?
            </h2>

            <div className="space-y-4 text-gray-300">
              <p>
                For app-related queries (bookings, payments, HashCoins),
                write to us at:
              </p>

              <p className="text-green-400 font-semibold">
                support@hashforgamers.co.in
              </p>

              <p>
                For business or partnership enquiries, reach out via our website.
              </p>

              <p>
                Visit our <span className="text-green-400 font-semibold">
                Help & FAQs
                </span> section in the app for quick answers.
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="p-10 backdrop-blur-xl bg-black/40">
            <h3 className="text-3xl font-bold text-green-400 mb-6">
              Company Info
            </h3>

            <div className="space-y-4 text-gray-300 text-sm">
              <p>
                <span className="text-green-400 font-semibold">Company Name:</span><br />
                Hash for Gamers Private Limited
              </p>

              <p>
                <span className="text-green-400 font-semibold">Support Email:</span><br />
                support@hashforgamers.co.in
              </p>

              <p>
                <span className="text-green-400 font-semibold">Website:</span><br />
                www.hashforgamers.com
              </p>

              <p>
                <span className="text-green-400 font-semibold">Registered Office:</span><br />
                Hash for Gamers Private Limited<br />
                Mumbai, Maharashtra, India
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-green-400 transition z-20"
        >
          <X size={28} />
        </button>
      </div>
    </div>
  );
}
