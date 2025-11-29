// src/components/EnquiryFormSimple.jsx
import React, { useState } from "react";
import API from "../services/api";

export default function EnquiryFormSimple({
  propertyTitle = "",
  propertyId = "",
  propertyRef = "",
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    wish: "",
    meeting: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    let newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!String(value || "").trim()) newErrors[key] = "This field is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!validate()) return;

    setBusy(true);
    try {
      const payload = {
        ...formData,
        propertyTitle: propertyTitle || undefined,
        propertyId: propertyId || undefined,
        propertyRef: propertyRef || undefined,
      };

      const res = await API.post("/enquiry", payload);

      if (res?.data?.success) {
        alert("Your enquiry has been sent successfully!");
        setFormData({
          name: "",
          email: "",
          wish: "",
          meeting: "",
          message: "",
        });
        setErrors({});
        setStatus(`Sent — ref ${res.data.refNumber ?? ""}`);
      } else {
        alert("Failed to send enquiry. Please try again.");
      }
    } catch (error) {
      console.error("Error sending enquiry:", error);
      alert(
        error?.response?.data?.message ||
          "Server error. Please try again later."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase mb-2 text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className={`w-full border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-md px-4 py-3 focus:outline-none`}
            required
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase mb-2 text-gray-700">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className={`w-full border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md px-4 py-3 focus:outline-none`}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* What do you wish */}
        <div>
          <label className="block text-xs font-semibold uppercase mb-2 text-gray-700">
            What do you wish? *
          </label>
          <div className="relative">
            <select
              name="wish"
              value={formData.wish}
              onChange={handleChange}
              className={`w-full appearance-none border ${
                errors.wish ? "border-red-500" : "border-gray-300"
              } rounded-md px-4 py-3 pr-10 focus:outline-none text-gray-700`}
              required
            >
              <option value="" disabled className="text-gray-400">
                Select an option
              </option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="expertise">Expertise</option>
              <option value="other">Other</option>
            </select>

            {/* Dropdown icon */}
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {errors.wish && (
            <p className="text-red-500 text-xs mt-1">{errors.wish}</p>
          )}
        </div>

        {/* Meeting Type - Radio Buttons */}
        <div>
          <label className="block text-xs font-semibold uppercase mb-3 text-gray-700">
            How would you like to conduct the meeting? *
          </label>

          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="radio"
                name="meeting"
                value="physical"
                checked={formData.meeting === "physical"}
                onChange={handleChange}
                required
                className="w-4 h-4 text-black border-gray-400 rounded-full"
              />
              <span>Physically</span>
            </label>

            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="radio"
                name="meeting"
                value="digital"
                checked={formData.meeting === "digital"}
                onChange={handleChange}
                required
                className="w-4 h-4 text-black border-gray-400 rounded-full"
              />
              <span>Digital</span>
            </label>
          </div>

          {errors.meeting && (
            <p className="text-red-500 text-xs mt-1">{errors.meeting}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold uppercase mb-2 text-gray-700">
            Message *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your message..."
            className={`w-full h-36 border ${
              errors.message ? "border-red-500" : "border-gray-300"
            } rounded-md px-4 py-3 focus:outline-none resize-none`}
            required
          />
          {errors.message && (
            <p className="text-red-500 text-xs mt-1">{errors.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full cursor-pointer bg-black text-white py-3 rounded-md hover:bg-gray-800 transition font-medium"
          disabled={busy}
        >
          {busy ? "Sending…" : "Get in Touch"}
        </button>

        {status && (
          <p className="text-sm mt-2 text-gray-700 text-center">{status}</p>
        )}
      </form>
    </div>
  );
}
