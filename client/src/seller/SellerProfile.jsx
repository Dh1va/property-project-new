// src/seller/SellerProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { FaUser, FaSave, FaArrowLeft, FaRedo, FaBuilding, FaPhone } from "react-icons/fa";

const defaultForm = {
  name: "",
  email: "",
  company: "",
  phone: "",
  city: "",
  pincode: "",
};

export default function SellerProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await API.get("/sellers/me");
      const data = res.data || {};
      setForm({
        ...defaultForm,
        ...data,
      });
    } catch (err) {
      console.error("Failed to load profile", err);
      setError(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { name, phone, pincode } = form;
    if (!name) {
      setError("Name is required.");
      return;
    }
    if (phone && phone.length < 7) {
      setError("Enter valid phone");
      return;
    }
    if (pincode && !/^\d{4,6}$/.test(pincode)) {
      setError("Enter valid pincode");
      return;
    }

    try {
      setSaving(true);
      const res = await API.patch("/sellers/me", form);
      if (res?.data) {
        setSuccess("Profile updated successfully.");
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center text-gray-600">
          <FaRedo className="animate-spin inline-block mr-2 text-blue-500" />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                <FaUser className="text-sm" />
              </span>
              <span>Seller Profile</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Keep your details up to date so buyers and the admin can reach you easily.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/seller/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-300 text-sm hover:bg-gray-50 shadow-sm"
          >
            <FaArrowLeft className="text-xs" />
            Back to Dashboard
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left profile card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold mb-3">
                  {form.name ? form.name.charAt(0).toUpperCase() : <FaUser />}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {form.name || "Your Name"}
                </h2>
                <p className="text-xs text-gray-500 break-all mt-1">
                  {form.email || "email@example.com"}
                </p>

                {form.company && (
                  <p className="mt-3 inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                    <FaBuilding className="text-[10px]" />
                    {form.company}
                  </p>
                )}

                {form.phone && (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-gray-600">
                    <FaPhone className="text-[10px]" />
                    {form.phone}
                  </p>
                )}
              </div>

              <div className="mt-5 border-t pt-4 text-xs text-gray-500 space-y-1">
                <p>
                  <span className="font-semibold text-gray-700">City: </span>
                  {form.city || "Not set"}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Pincode: </span>
                  {form.pincode || "Not set"}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchProfile}
                disabled={saving}
                className="mt-5 w-full py-2 rounded-full border text-sm flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50"
              >
                <FaRedo className="text-[11px]" />
                Refresh from server
              </button>
            </div>
          </div>

          {/* Right form card */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              {/* Alerts */}
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic info */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Email (login)
                      </label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        type="email"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                        disabled
                      />
                      <p className="mt-1 text-[11px] text-gray-400">
                        Email is used for login and cannot be changed here.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Company */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Company / Agency
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Company / Agency Name
                      </label>
                      <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Phone
                      </label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        placeholder="e.g. 98765 43210"
                      />
                    </div>
                  </div>
                </section>

                {/* Location */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Location
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        City
                      </label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        placeholder="Chennai, Coimbatore, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Pincode
                      </label>
                      <input
                        name="pincode"
                        value={form.pincode}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        placeholder="6000xx"
                      />
                    </div>
                  </div>
                </section>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={fetchProfile}
                    disabled={saving}
                    className="px-4 py-2 rounded-full border text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaRedo className="text-[11px]" />
                    Reset Changes
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FaSave className="text-[11px]" />
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
