import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";

export default function SellerLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext) || {};

  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please provide both email and password.");
      return;
    }

    try {
      setBusy(true);

      const res = await login({
        emailOrUsername: form.email,
        password: form.password,
        role: "seller",
      });

      if (res?.success) {
        navigate("/seller");
      } else {
        setError(res?.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.message || "Server error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">

        {/* ⭐ TOP-RIGHT BOLD LARGE BACK BUTTON */}
        <div className="flex justify-end mb-5">
          <Link
            to="/"
            className="text-lg font-semibold text-gray-900 hover:text-black flex items-center gap-2 transition"
          >
            {/* Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Seller Login
          </h2>

          {error && (
            <div className="text-sm text-red-600 mb-3 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2 bg-black text-white rounded hover:bg-gray-900 transition cursor-pointer"
            >
              {busy ? "Logging in…" : "Login"}
            </button>
          </form>

          {/* Register link */}
          <div className="flex justify-center mt-6 text-sm">
            <Link to="/seller/register" className="text-black font-semibold">
              New? Register here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
