// App.jsx
import React, { useState } from "react";
import "./App.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

// Helmet
import { Helmet, HelmetProvider } from "react-helmet-async";

// Components
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

import PrivacyPolicy from "./pages/PrivacyPolicy";

function MainApp() {
  const [showPreRegisterModal, setShowPreRegisterModal] = useState(false);
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Helmet SEO for Homepage */}
      <Helmet>
        <title>Hash Gamers | India’s Top Gaming Cafe Platform</title>
        <meta
          name="description"
          content="Find and list top gaming cafes across India. Hash Gamers is India’s ultimate gaming cafe discovery platform."
        />
        <meta property="og:title" content="Hash Gamers | Gaming Ka Naya Adda" />
        <meta
          property="og:description"
          content="Explore India’s top gaming cafes, list your own cafe, and connect with the gaming community."
        />
        <meta property="og:image" content="/hash-og-image.jpg" />
        <meta property="og:url" content="https://hashforgamers.co.in/" />
        <meta property="og:type" content="website" />
      </Helmet>

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
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
