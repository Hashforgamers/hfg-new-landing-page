import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  Eye,
  Settings,
  Lock,
  FileText,
  XCircle,
  IndianRupee,
} from "lucide-react";

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  const policyCards = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#64BD55]" />,
      title: "Introduction",
      content:
        "This Privacy Policy describes how Hashforgamers Pvt Ltd and its affiliates (collectively \"Hashforgamers Pvt Ltd\", \"we\", \"our\", \"us\") collect, use, share, protect or otherwise process your information through our website https://hashforgamers.co.in/. Please note, we do not offer any product/service under this Platform outside India and your personal data will primarily be stored and processed in India.",
    },
    {
      icon: <Eye className="w-5 h-5 text-[#64BD55]" />,
      title: "Collection",
      content:
        "We collect personal data when you use our Platform, services, or otherwise interact with us. This includes, but is not limited to, name, date of birth, address, contact information, identity proof, and payment details as applicable.",
    },
    {
      icon: <Settings className="w-5 h-5 text-[#64BD55]" />,
      title: "Usage",
      content:
        "We use personal data to provide services, improve user experience, resolve disputes, detect fraud, and enhance platform offerings. Customization and relevant communication are part of this usage.",
    },
    {
      icon: <Lock className="w-5 h-5 text-[#64BD55]" />,
      title: "Security",
      content:
        "Reasonable security practices are in place to protect your personal data from unauthorized access, disclosure, or misuse in compliance with applicable law.",
    },
    {
      icon: <FileText className="w-5 h-5 text-[#64BD55]" />,
      title: "Platform Nature",
      content:
        "Hashforgamers is not a gaming service provider. We facilitate booking of game tickets at partner gaming venues through our platform.",
    },
    {
      icon: <XCircle className="w-5 h-5 text-[#64BD55]" />,
      title: "Refund Policy",
      content:
        "All bookings made on our platform are final. We do not provide any refunds. Please read all policies thoroughly before confirming your booking.",
    },
    {
      icon: <IndianRupee className="w-5 h-5 text-[#64BD55]" />,
      title: "Pricing Information",
      content:
        "Pricing details for all gaming ticket bookings are transparently provided on the respective game listings on our website.",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-white font-noodle bg-[#64BD55]/10 backdrop-blur-lg deep-cut"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white hover:text-[#64BD55] transition"
              onClick={onClose}
            >
              <X size={28} />
            </button>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl uppercase text-center mb-4 tracking-wider">
              Privacy Policy
            </h2>
            <p className="text-center text-gray-300 mb-8">
              Your privacy is our priority. Learn how we protect and manage your data.
            </p>

            {/* Grid Cards */}
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              {policyCards.map((item, index) => (
                <div
                  key={index}
                  className="bg-transparent border border-white text-white p-4 rounded-none clip-input"
                >
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-[#64BD55] mb-2">
                    {item.icon} {item.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>

            {/* Detailed Info */}
            <div className="mt-10 space-y-6 text-sm text-gray-300 leading-relaxed">
              <div>
                <h4 className="text-[#64BD55] font-semibold">Data Collection & Usage</h4>
                <p>
                  We collect information that you provide directly to us, including but not limited to personal data during sign-up/registration such as name, date of birth, address, contact information, and payment details when necessary.
                </p>
              </div>

              <div>
                <h4 className="text-[#64BD55] font-semibold">Security Measures</h4>
                <p>
                  We implement robust security measures to protect your personal data from unauthorized access, disclosure, loss or misuse through reasonable security practices and procedures.
                </p>
              </div>

              <div>
                <h4 className="text-[#64BD55] font-semibold">Your Rights</h4>
                <p>
                  You have the right to access, rectify, and update your personal data. You can manage your information directly through the Platform's functionalities or contact our support team for assistance.
                </p>
              </div>

              <div>
                <h4 className="text-[#64BD55] font-semibold">Contact Us</h4>
                <p>
                  If you have any questions about our Privacy Policy or how we handle your data, please don't hesitate to contact our Data Protection Officer at{" "}
                  <a href="mailto:privacy@hashforgamers.co.in" className="underline text-[#64BD55]">
                    privacy@hashforgamers.co.in
                  </a>
                </p>
              </div>

              <div>
                <h4 className="text-[#64BD55] font-semibold">Important Notice</h4>
                <p>
                  As of yesterday, we have completed the KYC process and downloaded the updated policies in PDF format. These have now been incorporated into the website. Please review the Privacy Policy, Refund Policy, and Pricing Information accordingly.
                </p>
              </div>

              <div>
                <h4 className="text-[#64BD55] font-semibold">Refund Policy</h4>
                <p>
                  Please note that Hashforgamers does not provide any refunds for bookings made through our platform. All bookings are final. Make sure to review all details before confirming your purchase.
                </p>
              </div>

              <div>
                <h4 className="text-[#64BD55] font-semibold">Nature of Our Services</h4>
                <p>
                  We are not a gaming company. Hashforgamers acts solely as a booking platform that enables users to book game tickets across various gaming cafés and venues. All gaming services are managed by the respective partner cafés.
                </p>
              </div>

              <div>
                <h4 className="text-[#64BD55] font-semibold">Pricing Disclosure</h4>
                <p>
                  Pricing for game tickets is displayed transparently on our platform. Please refer to the listing pages for the latest pricing before making a booking.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrivacyPolicyModal;
