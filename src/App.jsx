import React, { useState } from "react";
import './App.css';

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
      {/* ✅ Pass to Navbar */}
      <Navbar onPreRegisterClick={() => setShowPreRegisterModal(true)} />

      {/* ✅ Pass to Hero */}
      <Hero openPreRegister={() => setShowPreRegisterModal(true)} />

      <Waitlist />
      <Features />
      <WhatIsHash />
      <HowItWorks />
      <CafePricing />

      {/* ✅ Pass to JoinCommunity */}
      <JoinCommunity openPreRegister={() => setShowPreRegisterModal(true)} />

      <Footer />

      {/* ✅ Pre-registration Modal */}
      <PreRegisterModal
        isOpen={showPreRegisterModal}
        onClose={() => setShowPreRegisterModal(false)}
      />

      {/* Optional: List Cafe Modal kept hidden */}
      <ListYourCafeModal isOpen={false} onClose={() => {}} />
    </div>
  );
}

export default App;
