import React, { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient"; // Supabase client import

const ContactUsModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🟢 Submitting form data:", formData);

    const { error } = await supabase.from("contact_messages").insert([
      {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      },
    ]);

    if (error) {
      console.error("🔴 Supabase Error:", error);
      alert("Something went wrong: " + error.message);
    } else {
      alert("✅ Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-3xl p-6 sm:p-8 text-white font-noodle max-h-[90vh] overflow-y-auto bg-[#64BD55]/10 backdrop-blur-lg deep-cut">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl uppercase text-center mb-4 tracking-wider">
          Contact Us
        </h2>

        <p className="text-center text-sm sm:text-base text-white/90 mb-6">
          Have questions about our gaming stations? Need help with booking?
          Our team of battle-hardened support warriors are ready to assist you.
        </p>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="name"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-transparent border border-white placeholder-white text-white p-3 rounded-none clip-input"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-transparent border border-white placeholder-white text-white p-3 rounded-none clip-input"
            required
          />
          <input
            name="subject"
            placeholder="Subject of your message"
            value={formData.subject}
            onChange={handleChange}
            className="w-full bg-transparent border border-white placeholder-white text-white p-3 rounded-none clip-input"
            required
          />
          <textarea
            name="message"
            placeholder="Write your message here..."
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full bg-transparent border border-white placeholder-white text-white p-3 rounded-none clip-input"
            required
          />

          <button
            type="submit"
            className="w-full max-w-xs mx-auto block py-2.5 px-6 bg-white text-green-800 font-bold uppercase tracking-wider mt-4 clip-input"
          >
            Send Message
          </button>
        </form>

        {/* Emergency Support Info */}
        <div className="mt-10 bg-white/10 border border-white p-4 text-sm sm:text-base rounded-md space-y-2">
          <h3 className="font-bold text-white mb-2 uppercase">Emergency Support</h3>
          <p className="text-white/90">
            Technical issues during gameplay? Our rapid response team is available 24/7.
          </p>
          <div className="flex items-start gap-2 text-green-300">
            <Mail size={18} className="mt-1" />
            <span>support@hashforgamers.co.in / hashforgamers@gmail.com</span>
          </div>
          <div className="flex items-start gap-2 text-green-300">
            <Phone size={18} className="mt-1" />
            <span>+91 9137757935</span>
          </div>
          <div className="flex items-start gap-2 text-green-300">
            <MapPin size={18} className="mt-1" />
            <span>Asmita Garden, Mira Road, Mumbai</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsModal;
