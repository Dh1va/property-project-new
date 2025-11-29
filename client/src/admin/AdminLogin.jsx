// src/admin/AdminLogin.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login({
      emailOrUsername: username,
      password,
      role: "admin",
    });

    if (res.success) navigate("/admin");
    else setError(res.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Sign In</h2>

        {error && (
          <div className="text-red-600 mb-4 text-center text-sm">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full border rounded-md p-2"
            required
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full border rounded-md p-2"
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transitio cursor-pointer"
          >
            Sign in
          </button>
        </form>

        {/* 🔙 Back inside the card – No hover effect on arrow */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-700 hover:text-black flex items-center justify-center gap-1"
          >
            <span className="text-lg">←</span>
            <span className="hover:underline">Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
