import { useState } from 'react'
import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'

import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Waitlist from "./components/Waitlist";
import Features from "./components/Features";
import WhatIsHash from "./components/WhatIsHash";
import HowItWorks from "./components/HowItWorks";
import CafePricing from "./components/CafePricing";
import JoinCommunity from './components/JoinCommunity';
import Footer from "./components/Footer";
import ListYourCafeModal from "./components/ListYourCafeModal";



function App() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <Hero />
      <Waitlist />
      <Features />
     <WhatIsHash />
      <HowItWorks />
      <CafePricing />
      <JoinCommunity />
      <Footer />
      <ListYourCafeModal isOpen={false} onClose={() => {}} />
     
      
     
    </div>
  );
}

export default App;
