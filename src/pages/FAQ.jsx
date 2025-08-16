import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function FAQ() {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 pt-24 pb-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Help & FAQs</h1>
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">What is HASH for Gamers?</h2>
            <p>
              HASH for Gamers is India’s top platform for discovering and booking gaming cafes, earning HashCoins, and connecting with the gaming community.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">How do I book a gaming cafe?</h2>
            <p>
              Browse available cafes on the app, select your preferred location, choose your slot, and confirm your booking. You’ll receive a confirmation instantly.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">What are HashCoins?</h2>
            <p>
              HashCoins are reward points you earn for bookings, referrals, and participating in events. You can redeem them for discounts and exclusive offers.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">How do I list my cafe?</h2>
            <p>
              Use the “List Your Cafe” option in the app or dashboard, fill in your details, and our team will get in touch to verify and onboard your cafe.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">How do I manage my cafe dashboard?</h2>
            <p>
              Log in to your dashboard to update cafe info, manage bookings, view analytics, and access support. For help, contact us at <a href="mailto:support@hashforgamers.co.in" className="text-blue-400 underline">support@hashforgamers.co.in</a>.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">How do I contact support?</h2>
            <p>
              Email us at <a href="mailto:support@hashforgamers.co.in" className="text-blue-400 underline">support@hashforgamers.co.in</a> or visit our <a href="/support" className="text-blue-400 underline">Support</a> page for more options.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}