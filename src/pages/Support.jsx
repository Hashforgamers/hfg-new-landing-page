import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Support() {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 pt-24 pb-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Need Help?</h1>
        <div className="space-y-4">
          <p>
            For app-related queries (bookings, payments, HashCoins), write to us at{" "}
            <a href="mailto:support@hashforgamers.co.in" className="text-blue-400 underline">
              support@hashforgamers.co.in
            </a>.
          </p>
          <p>
            For business or partnership enquiries, reach out via our{" "}
            <a href="https://www.hashforgamers.com" className="text-blue-400 underline">
              website
            </a>.
          </p>
          <p>
            Visit our <span className="font-semibold">Help & FAQs</span> section in the app for quick answers.
          </p>
          <hr className="my-6 border-gray-700" />
          <h2 className="text-xl font-semibold">Company Info</h2>
          <ul className="mt-2 space-y-2">
            <li>
              <span className="font-semibold">Company Name:</span> Hash for Gamers Private Limited
            </li>
            <li>
              <span className="font-semibold">Support Email:</span>{" "}
              <a href="mailto:support@hashforgamers.co.in" className="text-blue-400 underline">
                support@hashforgamers.co.in
              </a>
            </li>
            <li>
              <span className="font-semibold">Website:</span>{" "}
              <a href="https://www.hashforgamers.com" className="text-blue-400 underline">
                www.hashforgamers.com
              </a>
            </li>
            <li>
              <span className="font-semibold">Registered Office:</span>
              <br />
              Hash for Gamers Private Limited
              <br />
              Mumbai, Maharashtra, India
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}