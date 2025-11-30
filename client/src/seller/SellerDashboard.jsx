// src/seller/SellerDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  FaHome,
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTrashAlt,
  FaEdit,
  FaRedo,
} from "react-icons/fa";

/**
 * Seller Dashboard
 * - Shows seller stats (Total, Active, Pending, Rejected)
 * - Lists recent seller properties in the SAME style as AdminDashboard's "Recent properties"
 */

function StatCard({
  title,
  value,
  icon: Icon,
  colorClass = "bg-blue-500",
  subText,
  linkTo,
}) {
  return (
    <div
      className={`rounded-xl shadow-md ${colorClass} text-white p-4 flex flex-col justify-between min-h-[120px]`}
    >
      <div className="text-sm font-semibold leading-snug">{title}</div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-3xl md:text-4xl font-extrabold leading-none">
          {value ?? 0}
        </div>
        {Icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon className="w-6 h-6 opacity-95" />
          </div>
        )}
      </div>

      {subText && <div className="mt-3 text-xs opacity-90">{subText}</div>}

      {linkTo && (
        <div className="mt-3">
          <Link
            to={linkTo}
            className="inline-flex items-center gap-2 text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition"
          >
            View
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SellerDashboard() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [busyIds, setBusyIds] = useState(new Set());
  const navigate = useNavigate();

  const fetchMyProperties = async () => {
    setLoading(true);
    try {
      const res = await API.get("/sellers/me/properties");
      setProperties(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch seller properties", err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  // counts
  const total = properties.length;
  const active = properties.filter(
    (p) => (p.status || "active") === "active"
  ).length;
  const pending = properties.filter(
    (p) => (p.status || "active") === "pending"
  ).length;
  const rejected = properties.filter(
    (p) => (p.status || "active") === "rejected"
  ).length;

  const markBusy = (id, yes = true) => {
    setBusyIds((prev) => {
      const n = new Set(prev);
      if (yes) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  const handleDelete = async (prop) => {
    if (
      !confirm(
        `Permanently delete "${prop.title}"? This cannot be undone.`
      )
    )
      return;
    const id = prop._id || prop.id;
    markBusy(id, true);
    try {
      await API.delete(`/properties/${id}`);
      setProperties((prev) =>
        prev.filter((p) => (p._id || p.id) !== id)
      );
    } catch (err) {
      console.error("Delete failed", err);
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      markBusy(id, false);
    }
  };

  const handleEdit = (prop) => {
    const id = prop._id || prop.id;
    navigate(`/seller/properties/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        <FaRedo className="animate-spin inline-block mr-2 text-blue-500" />{" "}
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      {/* Header – stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Seller Dashboard
        </h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchMyProperties}
            className="px-4 py-2 rounded bg-white border border-gray-300 hover:bg-gray-100 text-sm"
          >
            <FaRedo className="inline mr-2" /> Refresh
          </button>
          <Link
            to="/seller/properties/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            <FaPlus className="inline mr-2" /> Add Property
          </Link>
        </div>
      </div>

      {/* Stat cards – same responsive grid as admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="My Properties"
          value={total}
          icon={FaHome}
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
          subText="All listings you created"
          linkTo="/seller/properties"
        />
        <StatCard
          title="Active"
          value={active}
          icon={FaCheckCircle}
          colorClass="bg-gradient-to-br from-green-500 to-green-600"
          subText="Currently live"
          linkTo="/seller/properties?status=active"
        />
        <StatCard
          title="Pending Approval"
          value={pending}
          icon={FaClock}
          colorClass="bg-gradient-to-br from-yellow-500 to-yellow-600"
          subText="Waiting for admin review"
          linkTo="/seller/properties?status=pending"
        />
        <StatCard
          title="Rejected"
          value={rejected}
          icon={FaTimesCircle}
          colorClass="bg-gradient-to-br from-red-500 to-red-600"
          subText="Needs fix & resubmit"
          linkTo="/seller/properties?status=rejected"
        />
      </div>

      {/* Main area: Recent properties block (same style as admin) + side cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       {/* LEFT: Recent properties (admin-style list + action row) */}
<div className="lg:col-span-2 space-y-4">
  <div className="bg-white p-4 rounded shadow">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">Your Recent Properties</h3>
      <div className="text-sm text-gray-500">{total} total</div>
    </div>

    {properties.length === 0 ? (
      <div className="text-gray-500 mt-4">
        You have no properties yet.
      </div>
    ) : (
      <ul className="mt-3 space-y-3">
        {properties.slice(0, 6).map((p) => {
          const id = p._id || p.id;
          const img = p.images?.[0];
          const price = p.totalPrice ?? p.price ?? null;
          const status = p.status || "active";
          const isBusy = busyIds.has(id);

          return (
            <li
              key={id}
              className="border border-gray-100 rounded-lg p-3 bg-white"
            >
              {/* TOP ROW */}
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="w-14 h-12 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                  {img ? (
                    <img
                      src={img}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400">
                      No image
                    </span>
                  )}
                </div>

                {/* Title + ID + Price */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {p.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {p.city || p.place || "-"} •{" "}
                        <span className="font-mono">
                          {p.refNumber || (id || "").slice(0, 8)}
                        </span>
                      </div>
                      {price !== null && (
                        <div className="text-xs text-gray-700 mt-0.5">
                          ₹ {Number(price).toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>

                    {/* Status chip */}
                    <span
                      className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${
                        status === "active"
                          ? "bg-green-100 text-green-800"
                          : status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Rejection reason */}
                  {status === "rejected" && p.rejectionReason && (
                    <div className="mt-1 text-xs text-red-600">
                      Reason: {p.rejectionReason}
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTON ROW */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => handleEdit(p)}
                  className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(p)}
                  disabled={isBusy}
                  className="px-3 py-1 rounded border text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>

                <Link
                  to={`/seller/properties/${id}`}
                  className="px-3 py-1 rounded border text-blue-600 hover:bg-blue-50"
                >
                  Open
                </Link>

                {p.agentNumber && (
                  <a
                    href={`tel:${p.agentNumber}`}
                    className="px-3 py-1 rounded border text-blue-600 hover:bg-blue-50"
                  >
                    Call Agent
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </div>
</div>


        {/* RIGHT: Profile / Support / Tips (unchanged) */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
            <h4 className="font-semibold text-gray-800">Profile</h4>
            <p className="text-sm text-gray-600 mt-2">
              Complete your profile (phone, company, city) to get more
              enquiries.
            </p>
            <Link
              to="/seller/profile"
              className="mt-3 inline-block text-sm text-blue-600"
            >
              Edit Profile →
            </Link>
          </div>

          <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
            <h4 className="font-semibold text-gray-800">Support</h4>
            <p className="text-sm text-gray-600 mt-2">
              Need help with a listing? Contact support or check the
              guidelines.
            </p>
            <Link
              to="/support"
              className="mt-3 inline-block text-sm text-blue-600"
            >
              Contact Support →
            </Link>
          </div>

          <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
            <h4 className="font-semibold text-gray-800">Tips</h4>
            <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
              <li>Use clear photos and a descriptive title.</li>
              <li>Fill agent number to get direct enquiries.</li>
              <li>
                Respond quickly to requests to improve conversion.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
