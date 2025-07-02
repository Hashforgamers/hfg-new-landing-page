import React, { useState } from "react";
import "./App.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Waitlist from "./components/Waitlist";
import Features from "./components/Features";
import WhatIsHash from "./components/WhatIsHash";
import HowItWorks from "./components/HowItWorks";
import CafePricing from "./components/CafePricing";
import JoinCommunity from "./components/JoinCommunity";
import Footer from "./components/Footer";
import ListYourCafeModal from "./components/ListYourCafeModal";
import PreRegisterModal from "./components/PreRegisterModal";

function App() {
  const [showPreRegisterModal, setShowPreRegisterModal] = useState(false);

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Navbar with Pre-register callback */}
      <Navbar onPreRegisterClick={() => setShowPreRegisterModal(true)} />
      <Hero openPreRegister={() => setShowPreRegisterModal(true)} />
      <Waitlist />
      <Features />
      <WhatIsHash />
      <HowItWorks />
      <CafePricing />
      <JoinCommunity openPreRegister={() => setShowPreRegisterModal(true)} />
      <Footer />

      {/* Pre-registration Modal */}
      <PreRegisterModal
        isOpen={showPreRegisterModal}
        onClose={() => setShowPreRegisterModal(false)}
      />

      {/* Optional: Hidden List Cafe Modal */}
      <ListYourCafeModal isOpen={false} onClose={() => {}} />

      {/* ✅ Vercel Analytics & Speed Insights (must be at root) */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
