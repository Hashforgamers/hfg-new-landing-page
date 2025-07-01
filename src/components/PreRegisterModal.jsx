import React, { useEffect, useState } from "react";
import { X, User, Clock, Gamepad } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["Personal Information", "Location Preferences", "Gaming Preferences"];

export default function PreRegisterModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    cafe: "",
    gamingTypes: [],
    favoriteGames: [],
    peakTime: "",
    groupSize: "",
  });

  useEffect(() => {
    if (isOpen) setIsVisible(true);
  }, [isOpen]);

  const closeModal = () => {
    setIsVisible(false);
    setStep(0);
    setErrors({});
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      city: "",
      cafe: "",
      gamingTypes: [],
      favoriteGames: [],
      peakTime: "",
      groupSize: "",
    });
    setTimeout(() => onClose(), 300);
  };

  const validateStep = () => {
    let newErrors = {};
    if (step === 0) {
      if (!formData.fullName) newErrors.fullName = true;
      if (!formData.phone) newErrors.phone = true;
      if (!formData.email) newErrors.email = true;
    } else if (step === 1) {
      if (!formData.city) newErrors.city = true;
    } else if (step === 2) {
      if (formData.gamingTypes.length === 0) newErrors.gamingTypes = true;
      if (formData.favoriteGames.length === 0) newErrors.favoriteGames = true;
      if (!formData.peakTime) newErrors.peakTime = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  const toggleSelect = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value],
      };
    });
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  const next = () => {
    if (validateStep()) setStep(prev => prev + 1);
  };

  const prev = () => setStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      console.log("Form Submitted", formData);
      closeModal();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl bg-black text-white border border-[#64BD55] rounded-xl overflow-y-auto max-h-[90vh]"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div className="p-5 border-b border-[#64BD55] flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Gamepad className="w-5 h-5" /> Pre-registration
              </h2>
              <X className="cursor-pointer hover:text-[#64BD55]" onClick={closeModal} />
            </div>

            <div className="px-6 pt-4 flex gap-6">
              {steps.map((label, i) => {
                const Icon = i === 0 ? User : i === 1 ? Clock : Gamepad;
                return (
                  <div
                    key={label}
                    className={`flex items-center gap-1 text-sm cursor-pointer ${
                      step === i ? "text-[#64BD55]" : "text-gray-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {step === 0 && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className={`form-input ${errors.fullName ? "border-red-500" : ""}`}
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`form-input ${errors.phone ? "border-red-500" : ""}`}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`form-input ${errors.email ? "border-red-500" : ""}`}
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <input
                    type="text"
                    placeholder="City / Area"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className={`form-input ${errors.city ? "border-red-500" : ""}`}
                  />
                  <input
                    type="text"
                    placeholder="Preferred Gaming Café (Optional)"
                    value={formData.cafe}
                    onChange={(e) => handleChange("cafe", e.target.value)}
                    className="form-input"
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <p className="mb-2 font-semibold">Gaming Type</p>
                    <div className="grid grid-cols-2 gap-3">
                      {["PC Gaming", "Console (PS5/Xbox)", "VR Gaming", "Mobile Esports"].map(type => (
                        <button
                          type="button"
                          key={type}
                          onClick={() => toggleSelect("gamingTypes", type)}
                          className={`form-btn ${
                            formData.gamingTypes.includes(type)
                              ? "bg-[#64BD55] text-black"
                              : "border border-gray-600 text-white"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {errors.gamingTypes && <p className="text-red-500 text-sm mt-1">Please select at least one.</p>}
                  </div>

                  <div>
                    <p className="mt-4 mb-2 font-semibold">Favorite Games</p>
                    <div className="grid grid-cols-2 gap-3">
                      {["Valorant", "CS2", "FIFA", "GTA V", "Call of Duty", "Fortnite", "PUBG", "Other"].map(game => (
                        <button
                          type="button"
                          key={game}
                          onClick={() => toggleSelect("favoriteGames", game)}
                          className={`form-btn ${
                            formData.favoriteGames.includes(game)
                              ? "bg-[#64BD55] text-black"
                              : "border border-gray-600 text-white"
                          }`}
                        >
                          {game}
                        </button>
                      ))}
                    </div>
                    {errors.favoriteGames && <p className="text-red-500 text-sm mt-1">Please select at least one.</p>}
                  </div>

                  <div className="pt-4">
                    <label className="block mb-2">Peak Gaming Hours</label>
                    <select
                      value={formData.peakTime}
                      onChange={(e) => handleChange("peakTime", e.target.value)}
                      className={`form-input ${errors.peakTime ? "border-red-500" : ""}`}
                    >
                      <option value="">Select time</option>
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                      <option>Late Night</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2">Group Size</label>
                    <select
                      value={formData.groupSize}
                      onChange={(e) => handleChange("groupSize", e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select group size</option>
                      <option>Solo Player</option>
                      <option>2-3 Players</option>
                      <option>4-5 Players</option>
                      <option>Full Squad</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-4">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={prev}
                    className="border border-[#64BD55] px-6 py-2 rounded-full hover:bg-[#64BD55]/20 transition"
                  >
                    Previous
                  </button>
                ) : <span />}

                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={next}
                    className="bg-[#64BD55] text-black px-6 py-2 rounded-full hover:bg-[#64BD55]/80 transition"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-[#64BD55] text-black px-6 py-2 rounded-full hover:bg-[#64BD55]/80 transition"
                  >
                    Submit
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
