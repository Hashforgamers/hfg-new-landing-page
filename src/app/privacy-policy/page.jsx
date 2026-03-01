"use client";

import React from "react";
import {
  ShieldCheck,
  Eye,
  Settings,
  Lock,
  FileText,
  XCircle,
  IndianRupee,
} from "lucide-react";

const theme = {
  primary: "#8E543E",       // your main accent
  soft: "rgba(142,84,62,0.08)", // soft card bg
  highlight: "#E3B998",     // light accent
};

export default function PrivacyPolicyPage() {
  const policyCards = [
    {
      icon: <ShieldCheck className="w-5 h-5" style={{ color: theme.primary }} />,
      title: "Introduction",
      content:
        'This Privacy Policy describes how Hashforgamers Pvt Ltd and its affiliates ("we", "our", "us") collect, use, and protect your data through https://hashforgamers.co.in/. Data is stored and processed in India.',
    },
    {
      icon: <Eye className="w-5 h-5" style={{ color: theme.primary }} />,
      title: "Collection",
      content:
        "We collect personal data such as name, contact details, date of birth, identity proof, and payment details when required.",
    },
    {
      icon: <Settings className="w-5 h-5" style={{ color: theme.primary }} />,
      title: "Usage",
      content:
        "Data is used to provide services, improve experience, prevent fraud, and communicate relevant updates.",
    },
    {
      icon: <Lock class="w-5 h-5" style={{ color: theme.primary }} />,
      title: "Security",
      content:
        "We follow reasonable security practices to protect your personal data from unauthorized access or misuse.",
    },
    {
      icon: <FileText className="w-5 h-5" style={{ color: theme.primary }} />,
      title: "Platform Nature",
      content:
        "Hashforgamers is not a gaming service provider. We only enable ticket bookings for partner gaming cafés.",
    },
    {
      icon: <XCircle className="w-5 h-5" style={{ color: theme.primary }} />,
      title: "Refund Policy",
      content:
        "All bookings are final. Hashforgamers does not provide refunds.",
    },
    {
      icon: <IndianRupee className="w-5 h-5" style={{ color: theme.primary }} />,
      title: "Pricing",
      content:
        "Pricing details are transparently displayed on the respective game listings.",
    },
  ];

  return (
    <div
      className="min-h-screen text-white px-6 py-16 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.75), rgba(0,0,0,0.9)), url('/gta6-miami-sunset.jpg')",
      }}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Title */}
        <h1 className="text-5xl uppercase text-center mb-4 font-black text-[#8E543E] tracking-wider">
          Privacy Policy
        </h1>
        <p className="text-center text-[#E3B998] mb-12">
          Your privacy matters. Here’s how we protect your data.
        </p>

        {/* Policy Cards */}
        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          {policyCards.map((item, index) => (
            <div
              key={index}
              className="backdrop-blur-lg border border-[#8E543E]/30 p-6 rounded-xl shadow-md"
              style={{ backgroundColor: theme.soft }}
            >
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3" style={{ color: theme.primary }}>
                {item.icon} {item.title}
              </h3>
              <p className="text-[#E3B998] leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-[#E3B998]">
          For any privacy-related queries, contact us at{" "}
          <a
            href="mailto:privacy@hashforgamers.co.in"
            className="underline"
            style={{ color: theme.primary }}
          >
            privacy@hashforgamers.co.in
          </a>
        </div>
      </div>
    </div>
  );
}