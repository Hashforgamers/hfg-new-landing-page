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
import PreRegisterModal from "./components/PreRegisterModal"; // ✅ make sure this path is correct

function App() {
  const [showPreRegisterModal, setShowPreRegisterModal] = useState(false);

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      {/* 👇 Pass the openModal function to Hero or Waitlist or anywhere */}
      <Hero openPreRegister={() => setShowPreRegisterModal(true)} />

      <Waitlist />
      <Features />
      <WhatIsHash />
      <HowItWorks />
      <CafePricing />
      <JoinCommunity />
      <Footer />

      {/* ✅ Show PreRegister Modal only when triggered */}
      <PreRegisterModal
        isOpen={showPreRegisterModal}
        onClose={() => setShowPreRegisterModal(false)}
      />

      {/* If you're using this later, keep it hidden for now */}
      <ListYourCafeModal isOpen={false} onClose={() => {}} />
    </div>
  );
}

export default App;
