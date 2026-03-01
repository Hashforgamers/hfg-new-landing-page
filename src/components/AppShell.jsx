'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/FooterSection';

import AboutUsModal from '@/components/AboutUsModal';
import ContactUsModal from '@/components/ContactUsModal';

import PartnerWithUsModal from '@/components/PartnerWithUsModal';
import HelpCenterModal from '@/components/HelpCenterModal';
import TermsModal from '@/components/TermsModal';

export default function AppShell({ children }) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Disable body scroll when any modal is open
  const isAnyModalOpen =
    aboutOpen ||
    contactOpen ||
    
    partnerOpen ||
    helpOpen ||
    termsOpen ||
    sidebarOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isAnyModalOpen]);

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        openAbout={() => setAboutOpen(true)}
        openContact={() => setContactOpen(true)}
       
        openPartner={() => setPartnerOpen(true)}
        openHelp={() => setHelpOpen(true)}
        openTerms={() => setTermsOpen(true)}
      />

      {/* Page Content */}
      <main>{children}</main>

      {/* Footer */}
      <Footer
        openAbout={() => setAboutOpen(true)}
        openContact={() => setContactOpen(true)}
        
        openPartner={() => setPartnerOpen(true)}
        openHelp={() => setHelpOpen(true)}
        openTerms={() => setTermsOpen(true)}
      />

      {/* Modals */}
      <AboutUsModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <ContactUsModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      
      <PartnerWithUsModal isOpen={partnerOpen} onClose={() => setPartnerOpen(false)} />
      <HelpCenterModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </>
  );
}
