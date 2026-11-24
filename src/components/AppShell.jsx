'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/FooterSection';

import ContactUsModal from '@/components/ContactUsModal';

import PartnerWithUsModal from '@/components/PartnerWithUsModal';
import HelpCenterModal from '@/components/HelpCenterModal';

export default function AppShell({ children }) {
  const [contactOpen, setContactOpen] = useState(false);
  
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Disable body scroll when any modal is open
  const isAnyModalOpen =
    contactOpen ||
    
    partnerOpen ||
    helpOpen ||
    sidebarOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isAnyModalOpen]);

  return (
    <div className="font-body">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        openContact={() => setContactOpen(true)}
       
        openPartner={() => setPartnerOpen(true)}
        openHelp={() => setHelpOpen(true)}
      />

      {/* Page Content */}
      <main id="main">{children}</main>

      {/* Footer */}
      <Footer
        openContact={() => setContactOpen(true)}
        
        openPartner={() => setPartnerOpen(true)}
        openHelp={() => setHelpOpen(true)}
      />

      {/* Modals */}
      <ContactUsModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      
      <PartnerWithUsModal isOpen={partnerOpen} onClose={() => setPartnerOpen(false)} />
      <HelpCenterModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
