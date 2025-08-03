import React, { useState } from "react";
import "./App.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { Helmet, HelmetProvider } from "react-helmet-async";

import MetaPixel from "./MetaPixel";

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
  // Modal state
  const [showPreRegisterModal, setShowPreRegisterModal] = useState(false);
  const [showListYourCafeModal, setShowListYourCafeModal] = useState(false);
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // React Router location, for page view tracking on route change
  const location = useLocation();

  // Fire PageView event on route change (SPA)
 // In MainApp component

  React.useEffect(() => {
    if (window.fbq) {
      window.fbq("track", "PageView"); // standard event name
      console.log("✅ Meta Pixel: PageView event sent");
    }
  }, [location]);

  const handleOpenPreRegister = () => {
    setShowPreRegisterModal(true);
    if (window.fbq) {
      window.fbq("trackCustom", "PreRegisterUser");
      console.log("✅ Meta Pixel: PreRegisterUser event sent");
    }
  };

  const handleOpenListYourCafeModal = () => {
    setShowListYourCafeModal(true);
    if (window.fbq) {
      window.fbq("trackCustom", "ListYourCafe");
      console.log("✅ Meta Pixel: ListYourCafe event sent");
    }
  };


  return (
    <div className="bg-black min-h-screen text-white">
      {/* Add Meta Pixel script */}
      <MetaPixel />

      {/* Helmet SEO */}
      <Helmet>
        <title>Hash For Gamers | India’s Top Gaming Cafe Platform</title>
        <meta
          name="description"
          content="Find and list top gaming cafes across India. Hash For Gamers is India’s ultimate gaming cafe discovery platform."
        />
        <meta property="og:title" content="Hash For Gamers | Gaming Ka Naya Adda" />
        <meta
          property="og:description"
          content="Explore India’s top gaming cafes, list your own cafe, and connect with the gaming community."
        />
        <meta property="og:image" content="/hash-og-image.jpg" />
        <meta property="og:url" content="https://hashforgamers.co.in/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar onPreRegisterClick={handleOpenPreRegister} />

      <Hero openPreRegister={handleOpenPreRegister} />
      <Waitlist />
      <Features />
      <WhatIsHash />
      <HowItWorks />
      <CafePricing />
      <JoinCommunity openPreRegister={handleOpenPreRegister} />

      <Footer
        onAboutClick={() => setShowAboutPopup(true)}
        onTermsClick={() => setShowTermsModal(true)}
        onPrivacyClick={() => setShowPrivacyModal(true)}
        onListYourCafeClick={handleOpenListYourCafeModal}
      />

      <PreRegisterModal
        isOpen={showPreRegisterModal}
        onClose={() => setShowPreRegisterModal(false)}
      />

      <ListYourCafeModal
        isOpen={showListYourCafeModal}
        onClose={() => setShowListYourCafeModal(false)}
      />

      <AboutPopup isOpen={showAboutPopup} onClose={() => setShowAboutPopup(false)} />

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

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
