'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

const Footer = ({
  openAbout,
  openContact,
  openPrivacy,
  openHelp,
  openPartner,
  openTerms // ✅ Added
}) => {

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Gaming Cafes', href: '/gaming-cafes' },
        { label: 'Tournaments', href: '/tournaments' },
        { label: 'Shop Gear', href: '/shop' },
        { label: 'Rewards', href: '/rewards' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', action: 'about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Blog', href: '/blog' },
        { label: 'Press Kit', href: '/press' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', action: 'help' },
        { label: 'Contact Us', action: 'contact' },
        { label: 'Terms & Conditions', action: 'terms' }, // ✅ Fixed
        { label: "Privacy Policy", href: "/privacy-policy" },
      ]
    },
    {
      title: 'For Business',
      links: [
        { label: 'List Your Cafe', href: '/list-cafe' },
        
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com/hashforgamers' },
    { icon: Twitter, href: 'https://twitter.com/hashforgamers' },
    { icon: Youtube, href: 'https://youtube.com/@hashforgamers' },
    { icon: Linkedin, href: 'https://linkedin.com/company/hashforgamers' }
  ];

  const handleAction = (action) => {
    switch (action) {
      case 'about':
        return openAbout?.();
      case 'contact':
        return openContact?.();
      case 'privacy':
        return openPrivacy?.();
      case 'help':
        return openHelp?.();
      case 'partner':
        return openPartner?.();
      case 'terms': // ✅ Added
        return openTerms?.();
      default:
        return null;
    }
  };

  return (
    <footer className="bg-black text-gray-400 py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">

        {/* Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-bold text-lg mb-4">
                {section.title}
              </h3>

              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.action ? (
                      <button
                        onClick={() => handleAction(link.action)}
                        className="hover:text-green-400 transition"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className="hover:text-green-400 transition"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mb-8" />

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mb-8">
          {socialLinks.map((social, index) => (
            <Link
              key={index}
              href={social.href}
              target="_blank"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-green-500 transition"
            >
              <social.icon size={20} className="text-white" />
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm">
          © 2025 HashForGamers. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
