'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { SITE_DOWNLOAD_URL } from '@/lib/site';

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
        { label: 'Rewards', href: '/rewards' },
        { label: 'Shop', href: '/shop' },
        { label: 'Download App', href: SITE_DOWNLOAD_URL }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', action: 'about' },
        { label: 'Contact Us', action: 'contact' },
        { label: 'Instagram', href: 'https://instagram.com/hashforgamers' },
        { label: 'LinkedIn', href: 'https://linkedin.com/company/hashforgamers' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', action: 'help' },
        { label: 'Terms & Conditions', action: 'terms' }, // ✅ Fixed
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Delete Account", href: "/delete-account" },
      ]
    },
    {
      title: 'For Business',
      links: [
        { label: 'List Your Cafe', href: '/list-cafe' },
        { label: 'Partner With Hash', action: 'partner' },
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
    <footer className="bg-black px-6 py-12 text-gray-400 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-[#16FF00]">
                Premium Gaming Access
              </p>
              <h3 className="mt-3 text-2xl font-black uppercase tracking-[0.12em] text-white md:text-3xl">
                The premium gaming brand for players who expect more.
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/70">
                Hash is where serious gamers discover elite cafes, reserve high-quality setups, build identity, unlock rewards, and stay inside one premium ecosystem. For operators, it turns demand into a cleaner, stronger, more valuable gaming business.
              </p>
            </div>

            <Link
              href={SITE_DOWNLOAD_URL}
              className="inline-flex w-fit items-center rounded-full border border-[#16FF00]/40 bg-[#16FF00]/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#16FF00] transition hover:bg-[#16FF00] hover:text-black"
            >
              Download Hash
            </Link>
          </div>
        </div>

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
