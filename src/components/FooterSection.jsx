'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { SITE_DOWNLOAD_URL, SITE_ONBOARD_URL } from '@/lib/site';

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
        { label: 'Tournaments', href: '/tournaments' },
        { label: 'Blog', href: '/blog' },
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
        { label: 'Help Center', href: '/support' },
        { label: 'Terms & Conditions', action: 'terms' }, // ✅ Fixed
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Delete Account", href: "/delete-account" },
      ]
    },
    {
      title: 'For Business',
      links: [
        { label: 'Onboard Your Cafe', href: SITE_ONBOARD_URL },
        { label: 'Cafe Cost Calculator', href: '/gaming-cafe-cost-calculator' },
        { label: 'Request a Callback', href: '/list-cafe' },
        { label: 'Partner With Hash', action: 'partner' },
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com/hashforgamers', label: 'Hash on Instagram' },
    { icon: Twitter, href: 'https://twitter.com/hashforgamers', label: 'Hash on X' },
    { icon: Youtube, href: 'https://youtube.com/@hashforgamers', label: 'Hash on YouTube' },
    { icon: Linkedin, href: 'https://linkedin.com/company/hashforgamers', label: 'Hash on LinkedIn' }
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

  const linkClass =
    'text-sm text-white/60 transition hover:text-white focus-visible:text-white';

  return (
    <footer className="bg-black px-4 pb-10 pt-20 text-white sm:px-8">
      <div className="mx-auto max-w-[1600px]">
        <p
          className="select-none font-display text-[clamp(5rem,22vw,22rem)] uppercase leading-[0.8] text-white/[0.06]"
          aria-hidden="true"
        >
          Hash
        </p>

        <div className="mt-10 grid grid-cols-2 gap-10 border-t border-white/15 pt-10 md:grid-cols-4">
          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="font-tech mb-5 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#ff9a3d]">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.action ? (
                      <button type="button" onClick={() => handleAction(link.action)} className={linkClass}>
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={linkClass}
                        data-track={
                          link.href === SITE_DOWNLOAD_URL
                            ? 'app_download_click'
                            : link.href === SITE_ONBOARD_URL
                              ? 'cafe_onboard_click'
                              : undefined
                        }
                        data-track-store={link.href === SITE_DOWNLOAD_URL ? 'onelink' : undefined}
                        data-track-placement="footer"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/15 pt-8 sm:flex-row sm:items-center">
          <p className="font-tech text-[11px] uppercase tracking-[0.2em] text-white/40">
            © {new Date().getFullYear()} Hash For Gamers · Made in India
          </p>
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener"
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-white hover:bg-white hover:text-black"
              >
                <social.icon size={18} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
