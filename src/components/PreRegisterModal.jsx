import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";

export default function PreRegisterModal({ isOpen, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    email: "",
  });

  useEffect(() => {
    if (isOpen) setIsVisible(true);
  }, [isOpen]);

  const closeModal = () => {
    setIsVisible(false);
    setErrors({});
    setFormData({
      fullName: "",
      phone: "",
      whatsapp: "",
      email: "",
    });
    setTimeout(() => onClose(), 300);
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Please enter full name.";
    if (!formData.phone) newErrors.phone = "Please enter phone number.";
    if (!formData.whatsapp) newErrors.whatsapp = "Please enter WhatsApp number.";
    if (!formData.email) newErrors.email = "Please enter email address.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const { error } = await supabase.from("pre_registrations").insert([
        {
          full_name: formData.fullName,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          email: formData.email,
        },
      ]);

      if (error) {
        console.error("Supabase Insert Error:", error.message);
        alert("Something went wrong. Please try again.");
      } else {
        alert("Successfully pre-registered!");
        closeModal();
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-3xl p-6 sm:p-8 text-white font-noodle max-h-[90vh] overflow-y-auto bg-[#64BD55]/10 backdrop-blur-lg deep-cut"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-3xl"
            >
              ×
            </button>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl uppercase text-center mb-6 tracking-wider">
              Pre-registration
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={`w-full bg-transparent border placeholder-white text-white p-3 rounded-none clip-input ${
                    errors.fullName ? "border-red-500" : "border-white/20"
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`w-full bg-transparent border placeholder-white text-white p-3 rounded-none clip-input ${
                    errors.phone ? "border-red-500" : "border-white/20"
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

             

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full bg-transparent border placeholder-white text-white p-3 rounded-none clip-input ${
                    errors.email ? "border-red-500" : "border-white/20"
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  className="bg-[#64BD55] text-black px-6 py-2 rounded-full hover:bg-[#64BD55]/80 transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
