import React, { useState, useRef, useEffect } from 'react';
import logo from "../assets/hash-logo.png"; // Ensure your logo is named hash-logo.png and placed in src/assets

const menuItems = [
  'Features',
  'What Is Hash?',
  'How It Works?',
  'List Your Cafe With Us',
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    if (!mobileOpen) return;
    function handleClick(e) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/20 backdrop-blur-sm h-[60px] flex items-center justify-between px-4 sm:px-6 md:px-8 shadow-md z-50">

      {/* Logo */}
      <div className="flex items-center justify-start h-full">
        <img 
          src={logo} 
          alt="Hash for Gamers Logo" 
          className="h-10 sm:h-11 md:h-12 w-auto transition-all duration-200" 
        />
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center justify-center gap-8 lg:gap-12">
        {menuItems.map((item) => (
          <li 
            key={item} 
            className="text-white text-sm font-medium hover:text-green-400 transition-colors duration-200 cursor-pointer whitespace-nowrap"
          >
            {item}
          </li>
        ))}
      </ul>

      {/* Button & Hamburger Container */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Pre Register Button */}
        <button
          className="bg-[#2ea836] text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-[6px] sm:py-2 flex items-center justify-center shadow-none border-none hover:bg-[#24912b] transition-colors duration-200"
          style={{
            clipPath: 'polygon(10% 0, 0% 50%, 0 100%, 90% 100%, 100% 50%, 100% 0)',
          }}
        >
          Pre Register
        </button>

        {/* Hamburger Button */}
        <button
          ref={hamburgerRef}
          className="md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-green-400 rounded-md transition-all duration-200"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span className={`w-full h-[2px] bg-white transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-full h-[2px] bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`w-full h-[2px] bg-white transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-[60px] right-0 w-full sm:w-[300px] h-[calc(100vh-60px)] bg-black/95 backdrop-blur-md transform transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col items-stretch p-4">
          {menuItems.map((item, index) => (
            <button
              key={item}
              className="text-white text-base font-medium py-4 text-left hover:text-green-400 transition-colors duration-200 border-b border-white/10 last:border-none focus:outline-none focus:text-green-400"
              onClick={() => setMobileOpen(false)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;