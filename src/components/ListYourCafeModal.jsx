import React, { useState } from "react";
import stateCityData from "../data/stateCity.json";

const ListYourCafeModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    cafeName: "",
    city: "",
    state: "",
    ownerName: "",
    contact: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "state" ? { city: "" } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    onClose();
  };

  if (!isOpen) return null;

  const cities = stateCityData[formData.state] || [];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div
  className="relative w-full max-w-3xl p-6 sm:p-8 text-white font-noodle max-h-[90vh] overflow-y-auto bg-[#64BD55]/10 backdrop-blur-lg deep-cut"
>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl "
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl uppercase text-center mb-4 tracking-wider">
          List Your Cafe With Us
        </h2>

        {/* Cafe Details */}
      <div className="flex items-center gap-4 text-white uppercase font-semibold tracking-wider text-center my-6">
  <div className="flex-grow border-t border-white"></div>
  <span className="text-sm sm:text-base whitespace-nowrap">Cafe Details</span>
  <div className="flex-grow border-t border-white"></div>
</div>



        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cafe Name */}
          <input
            name="cafeName"
            placeholder="Enter the complete name"
            value={formData.cafeName}
            onChange={handleChange}
            className="w-full bg-transparent border border-white placeholder-white text-white p-3 rounded-none clip-input"
            required
          />

          {/* City + State */}
          <div className="grid grid-cols-2 gap-4">
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="bg-transparent border border-white text-white p-3 rounded-none clip-input"
              required
            >
              <option value="">City</option>
              {cities.map((city) => (
                <option key={city} value={city} className="text-black">
                  {city}
                </option>
              ))}
            </select>

            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="bg-transparent border border-white text-white p-3 rounded-none clip-input"
              required
            >
              <option value="">State</option>
              {Object.keys(stateCityData).map((state) => (
                <option key={state} value={state} className="text-black">
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Owner Details */}
          <div className="text-white font-semibold uppercase tracking-wider border-t border-white pt-4 mb-4 text-center">
            Owner Details
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              name="ownerName"
              placeholder="Enter full name"
              value={formData.ownerName}
              onChange={handleChange}
              className="bg-transparent border border-white placeholder-white text-white p-3 rounded-none clip-input"
              required
            />
            <input
              name="contact"
              placeholder="Contact number"
              value={formData.contact}
              onChange={handleChange}
              className="bg-transparent border border-white placeholder-white text-white p-3 rounded-none clip-input"
              required
            />
          </div>

          <input
            name="email"
            placeholder="Enter your email id"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-transparent border border-white placeholder-white text-white p-3 rounded-none clip-input"
            required
          />

          {/* Submit */}
         <button
  type="submit"
  className="w-full max-w-xs mx-auto block py-2.5 px-6 bg-white text-green-800 font-bold uppercase tracking-wider mt-4 clip-input"
>
  Submit
</button>


        </form>
      </div>
    </div>
  );
};

export default ListYourCafeModal;
