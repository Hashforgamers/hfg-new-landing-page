// App.jsx
import React, { useState } from "react";
import "./App.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { BrowserRouter, Routes, Route } from "react-router-dom";


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
import TermsModal from "./components/TermsModal";
import PrivacyPolicyModal from "./components/PrivacyPolicyModal";

import Chatwoot from "./pages/chatwoot"; // ✅ Add this import

function MainApp() {
  const [showPreRegisterModal, setShowPreRegisterModal] = useState(false);
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar onPreRegisterClick={() => setShowPreRegisterModal(true)} />

      <Hero openPreRegister={() => setShowPreRegisterModal(true)} />
      <Waitlist />
      <Features />
      <WhatIsHash />
      <HowItWorks />
      <CafePricing />
      <JoinCommunity openPreRegister={() => setShowPreRegisterModal(true)} />

      <Footer
        onAboutClick={() => setShowAboutPopup(true)}
        onTermsClick={() => setShowTermsModal(true)}
        onPrivacyClick={() => setShowPrivacyModal(true)}
      />

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

      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Vercel Tracking */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/chatwoot.html" element={<Chatwoot />} /> {/* ✅ Your support page */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;