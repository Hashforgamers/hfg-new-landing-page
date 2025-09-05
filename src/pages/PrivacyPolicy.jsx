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

const policyCards = [
  {
    icon: <ShieldCheck className="w-5 h-5 text-[#64BD55]" />,
    title: "Introduction",
    content:
      "This Privacy Policy describes how Hashforgamers Pvt Ltd and its affiliates (collectively 'Hashforgamers Pvt Ltd', 'we', 'our', 'us') collect, use, share, protect or otherwise process your information through our website https://hashforgamers.co.in/.",
  },
  {
    icon: <Eye className="w-5 h-5 text-[#64BD55]" />,
    title: "Collection",
    content:
      "We collect personal data when you use our Platform, services, or interact with us. This includes name, DOB, address, ID proof, and payment details.",
  },
  {
    icon: <Settings className="w-5 h-5 text-[#64BD55]" />,
    title: "Usage",
    content:
      "We use your data to deliver services, improve experience, detect fraud, and communicate relevant updates.",
  },
  {
    icon: <Lock className="w-5 h-5 text-[#64BD55]" />,
    title: "Security",
    content:
      "We use reasonable security measures to protect your data from unauthorized access, misuse, or disclosure.",
  },
  {
    icon: <FileText className="w-5 h-5 text-[#64BD55]" />,
    title: "Platform Nature",
    content:
      "Hashforgamers is not a gaming provider. We facilitate game ticket booking at partnered cafés.",
  },
  {
    icon: <XCircle className="w-5 h-5 text-[#64BD55]" />,
    title: "Refund Policy",
    content:
      "All bookings are final. No refunds. Please review policies before confirming.",
  },
  {
    icon: <IndianRupee className="w-5 h-5 text-[#64BD55]" />,
    title: "Pricing Information",
    content:
      "Transparent pricing is provided for all games listed on our site.",
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="p-6 sm:p-10 text-white font-noodle bg-[#0e0e0e] min-h-screen">
      <h1 className="text-3xl sm:text-4xl text-center uppercase mb-4 tracking-wide">
        Privacy Policy
      </h1>
      <p className="text-center text-gray-300 mb-8">
        Your privacy is our priority. Learn how we protect and manage your data.
      </p>

      {/* Policy Cards */}
      <div className="grid sm:grid-cols-2 gap-6 text-sm mb-10">
        {policyCards.map((item, index) => (
          <div
            key={index}
            className="bg-transparent border border-white p-4 rounded-none clip-input"
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[#64BD55] mb-2">
              {item.icon} {item.title}
            </h3>
            <p className="text-gray-300 leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>

      {/* Extra Details */}
      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        <div>
          <h4 className="text-[#64BD55] font-semibold">Data Collection & Usage</h4>
          <p>
            We collect information you provide during registration or booking, including name, DOB, contact, and payment info.
          </p>
        </div>
        <div>
          <h4 className="text-[#64BD55] font-semibold">Security Measures</h4>
          <p>
            We use technical and organizational safeguards to secure your data from unauthorized access or misuse.
          </p>
        </div>
        <div>
          <h4 className="text-[#64BD55] font-semibold">Your Rights</h4>
          <p>
            You can access, modify, or delete your personal data. Contact our support for assistance.
          </p>
        </div>
        <div>
          <h4 className="text-[#64BD55] font-semibold">Contact Us</h4>
          <p>
            Email us at{" "}
            <a href="mailto:privacy@hashforgamers.co.in" className="underline text-[#64BD55]">
              privacy@hashforgamers.co.in
            </a>{" "}
            for privacy-related queries.
          </p>
        </div>
        <div>
          <h4 className="text-[#64BD55] font-semibold">Service Disclaimer</h4>
          <p>
            We only act as a ticket booking platform. Gaming services are delivered by partnered cafés.
          </p>
        </div>
        <div>
          <h4 className="text-[#64BD55] font-semibold">App Store Privacy Requirements</h4>
          <ul className="list-disc ml-5 space-y-2">
            <li>
              <span className="font-semibold text-white">Privacy Policy:</span> You must publish &amp; link a proper privacy policy (hosted on your site).
            </li>
            <li>
              <span className="font-semibold text-white">App Privacy Details (App Store Connect):</span> Must be filled with correct data collection &amp; usage.
            </li>
            <li>
              <span className="font-semibold text-white">ATT (App Tracking Transparency):</span> If you track users across apps/sites, you must request ATT permission.
            </li>
            <li>
              <span className="font-semibold text-white">Account Deletion:</span> App must let users delete their account fully from inside the app (not just by emailing support).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
