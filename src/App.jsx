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
import AboutPopup from "./components/AboutPopup";
import TermsModal from "./components/TermsModal"; // ✅ Import TermsModal

function App() {
  const [showPreRegisterModal, setShowPreRegisterModal] = useState(false);
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false); // ✅ State for Terms popup

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Navbar */}
      <Navbar onPreRegisterClick={() => setShowPreRegisterModal(true)} />

      {/* Sections */}
      <Hero openPreRegister={() => setShowPreRegisterModal(true)} />
      <Waitlist />
      <Features />
      <WhatIsHash />
      <HowItWorks />
      <CafePricing />
      <JoinCommunity openPreRegister={() => setShowPreRegisterModal(true)} />

      {/* Footer with both popups triggers */}
      <Footer
        onAboutClick={() => setShowAboutPopup(true)}
        onTermsClick={() => setShowTermsModal(true)} // ✅ Hooked Terms button
      />

      {/* Modals */}
      <PreRegisterModal
        isOpen={showPreRegisterModal}
        onClose={() => setShowPreRegisterModal(false)}
      />

      <ListYourCafeModal isOpen={false} onClose={() => {}} />

      <AboutPopup
        isOpen={showAboutPopup}
        onClose={() => setShowAboutPopup(false)}
      />

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      {/* Vercel Tracking */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
