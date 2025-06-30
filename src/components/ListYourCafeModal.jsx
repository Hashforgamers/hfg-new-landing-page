import React, { useState } from "react";
import stateCityData from "../data/stateCity.json";

const ListYourCafeModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    cafeName: "",
    ownerName: "",
    contact: "",
    email: "",
    state: "",
    city: "",
    address: "",
    pincode: "",
    capacity: "",
    platforms: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const newPlatforms = checked
          ? [...prev.platforms, value]
          : prev.platforms.filter((p) => p !== value);
        return { ...prev, platforms: newPlatforms };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "state" ? { city: "" } : {}),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    onClose();
  };

  if (!isOpen) return null;

  const cities = stateCityData[formData.state] || [];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#111] text-white w-full max-w-2xl p-8 rounded-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl"
        >
          ×
        </button>

        <h2 className="text-3xl mb-6 font-bold uppercase tracking-wide">
          List Your Cafe
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="cafeName"
              placeholder="Cafe Name"
              value={formData.cafeName}
              onChange={handleChange}
              className="p-3 bg-[#222] border border-gray-600 rounded"
              required
            />
            <input
              name="ownerName"
              placeholder="Owner Name"
              value={formData.ownerName}
              onChange={handleChange}
              className="p-3 bg-[#222] border border-gray-600 rounded"
              required
            />
            <input
              name="contact"
              placeholder="Contact Number"
              value={formData.contact}
              onChange={handleChange}
              className="p-3 bg-[#222] border border-gray-600 rounded"
              required
            />
            <input
              name="email"
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="p-3 bg-[#222] border border-gray-600 rounded"
              required
            />
          </div>

          {/* Location Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="p-3 bg-[#222] border border-gray-600 rounded"
              required
            >
              <option value="">Select State</option>
              {Object.keys(stateCityData).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="p-3 bg-[#222] border border-gray-600 rounded"
              required
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Address and Pincode */}
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Full Cafe Address"
            className="w-full p-3 bg-[#222] border border-gray-600 rounded resize-none"
            rows={3}
            required
          />

          <input
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="Pincode"
            className="w-full p-3 bg-[#222] border border-gray-600 rounded"
            required
          />

          {/* Capacity & Platforms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Cafe Capacity (e.g., 20 players)"
              className="p-3 bg-[#222] border border-gray-600 rounded"
              required
            />

            <div className="flex flex-wrap gap-3">
              {["PC", "PS5", "Xbox", "VR", "Switch"].map((platform) => (
                <label key={platform} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="platforms"
                    value={platform}
                    checked={formData.platforms.includes(platform)}
                    onChange={handleChange}
                  />
                  <span>{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-500 w-full py-3 mt-4 rounded font-semibold uppercase tracking-wider"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ListYourCafeModal;
