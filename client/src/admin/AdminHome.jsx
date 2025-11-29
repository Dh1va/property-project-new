// src/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUsers,
  FaPlus,
  FaExchangeAlt,
  FaHome,
  FaUserTie,
  FaRedo,
} from "react-icons/fa";

/**
 * Admin Dashboard — StatCard order changed per request:
 *  - Title (top, NOT truncated)
 *  - Count + Icon (below title)
 *  - Subtext (below)
 *  - Link (bottom)
 */

// Currency helper
const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

// StatCard: title -> (value + icon) -> subText -> link
function StatCard({ title, value, icon: Icon, colorClass = "bg-blue-500", subText, linkTo }) {
  return (
    <div
      className={`rounded-xl shadow-md ${colorClass} text-white p-4 flex flex-col justify-between min-h-[120px]`}
      role="region"
      aria-label={title}
    >
      {/* Title (top) */}
      <div className="text-sm font-semibold leading-snug">
        {title}
      </div>

      {/* value + icon row */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-3xl md:text-4xl font-extrabold leading-none">
          {value ?? "0"}
        </div>
        {Icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon className="w-6 h-6 opacity-95" />
          </div>
        )}
      </div>

      {/* subtext */}
      {subText && <div className="mt-3 text-xs opacity-90">{subText}</div>}

      {/* link (bottom) */}
      {linkTo ? (
        <div className="mt-3">
          <Link
            to={linkTo}
            className="inline-flex items-center gap-2 text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition"
          >
            View <FaExchangeAlt className="w-3 h-3" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    active: 0,
    pending: 0,
    rejected: 0,
    totalSellers: 0,
    newSellers7d: 0,
  });

  const [pending, setPending] = useState([]);
  const [recentProps, setRecentProps] = useState([]);
  const [recentSellers, setRecentSellers] = useState([]);
  const [busyIds, setBusyIds] = useState(new Set());

  // load dashboard data
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [pendingRes, activeRes, sellersRes] = await Promise.allSettled([
        API.get("/admin/properties/pending"),
        API.get("/properties?status=active"),
        API.get("/admin/sellers"),
      ]);

      const pendingData = pendingRes.status === "fulfilled" ? pendingRes.value.data : [];
      const activeData = activeRes.status === "fulfilled" ? activeRes.value.data : [];
      const sellersData = sellersRes.status === "fulfilled" ? sellersRes.value.data : [];

      let rejectedCount = 0;
      try {
        const rej = await API.get("/properties?status=rejected");
        rejectedCount = Array.isArray(rej.data) ? rej.data.length : 0;
      } catch (e) {
        // ignore if unavailable
      }

      const totalProps = (activeData.length || 0) + (pendingData.length || 0) + rejectedCount;
      const totalSellers = sellersData.length || 0;

      let recent = [];
      try {
        const rp = await API.get("/properties?status=active");
        recent = Array.isArray(rp.data) ? rp.data.slice(0, 4) : [];
      } catch (e) {
        recent = [];
      }

      setStats({
        totalProperties: totalProps,
        active: activeData.length || 0,
        pending: pendingData.length || 0,
        rejected: rejectedCount,
        totalSellers,
        newSellers7d: sellersData.filter((s) => {
          if (!s.createdAt) return false;
          const created = new Date(s.createdAt);
          const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
          return diffDays <= 7;
        }).length,
      });

      setPending(pendingData.slice(0, 4));
      setRecentProps(recent);
      setRecentSellers(sellersData.slice(0, 4));
    } catch (err) {
      console.error("dashboard load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const markBusy = (id, yes = true) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (yes) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // approve single
  const approve = async (id) => {
    if (!confirm("Approve this property?")) return;
    markBusy(id, true);
    try {
      await API.put(`/admin/properties/${id}/approve`);
      setPending((p) => p.filter((x) => (x._id || x.id) !== id));
      setStats((s) => ({ ...s, pending: Math.max(0, s.pending - 1), active: s.active + 1 }));
    } catch (err) {
      alert(err?.response?.data?.message || "Approve failed");
    } finally {
      markBusy(id, false);
    }
  };

  // reject single
  const reject = async (id) => {
    const reason = prompt("Reject reason (shown to seller):", "Incomplete details");
    if (reason === null) return;
    if (!reason.trim()) { alert("Provide a reason"); return; }
    markBusy(id, true);
    try {
      await API.put(`/admin/properties/${id}/reject`, { reason });
      setPending((p) => p.filter((x) => (x._id || x.id) !== id));
      setStats((s) => ({ ...s, pending: Math.max(0, s.pending - 1), rejected: s.rejected + 1 }));
    } catch (err) {
      alert(err?.response?.data?.message || "Reject failed");
    } finally {
      markBusy(id, false);
    }
  };

  // bulk approve all pending (with confirmation)
  const bulkApproveAll = async () => {
    if (!confirm("Approve ALL pending properties shown on this dashboard? This will publish them immediately.")) return;
    try {
      for (const p of pending) {
        markBusy(p._id, true);
        try { await API.put(`/admin/properties/${p._id}/approve`); } catch (e) { console.error("approve error", e); }
        markBusy(p._id, false);
      }
      await fetchDashboard();
      alert("Bulk approve attempted. See counts above and refresh for latest.");
    } catch (err) {
      console.error(err);
      alert("Bulk approve failed");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-lg text-gray-600">
        <FaTachometerAlt className="animate-spin inline-block mr-2 text-blue-500" /> Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard
          title="Total Properties"
          value={stats.totalProperties}
          icon={FaHome}
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
          subText="All listings in the system"
          linkTo="/admin/properties"
        />
        <StatCard
          title="Active Listings"
          value={stats.active}
          icon={FaCheckCircle}
          colorClass="bg-gradient-to-br from-green-500 to-green-600"
          subText="Live on site"
          linkTo="/properties?status=active"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pending}
          icon={FaClock}
          colorClass="bg-gradient-to-br from-yellow-500 to-yellow-600"
          linkTo="/admin/properties?status=pending"
          subText="Review properties now"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={FaTimesCircle}
          colorClass="bg-gradient-to-br from-red-500 to-red-600"
          subText="Rejected by admins"
          linkTo="/properties?status=rejected"
        />
        <StatCard
          title="Total Sellers"
          value={stats.totalSellers}
          icon={FaUsers}
          colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
          subText="Accounts on platform"
          linkTo="/admin/sellers"
        />
        <StatCard
          title="New Sellers (7d)"
          value={stats.newSellers7d}
          icon={FaUserTie}
          colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600"
          subText={`+${stats.newSellers7d} this week`}
          linkTo="/admin/sellers"
        />
      </div>

      <hr className="my-8 border-gray-200" />

      {/* Quick actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={fetchDashboard}
          className="flex items-center px-5 py-2 text-sm font-semibold rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition shadow-sm"
        >
          <FaRedo className="mr-2" /> Refresh Data
        </button>
        <button
          onClick={bulkApproveAll}
          className="flex items-center px-5 py-2 text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 transition shadow-md"
        >
          <FaCheckCircle className="mr-2" /> Approve All Pending
        </button>
        <Link
          to="/admin/properties/new"
          className="flex items-center px-5 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition shadow-md"
        >
          <FaPlus className="mr-2" /> Add Property
        </Link>
        <Link
          to="/admin/sellers"
          className="flex items-center px-5 py-2 text-sm font-semibold rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition shadow-sm"
        >
          <FaUserTie className="mr-2" /> Manage Sellers
        </Link>
      </div>

      {/* Main content: Pending (left), Recent (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Pending approvals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Properties Awaiting Approval</h3>
              <span className="text-md font-semibold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                {stats.pending} pending
              </span>
            </div>

            {pending.length === 0 ? (
              <div className="text-gray-500 py-8 text-center bg-gray-50 rounded-lg">
                <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-2" />
                <p>All clear! No pending properties right now.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((p) => {
                  const id = p._id || p.id;
                  const isBusy = busyIds.has(id);

                  return (
                    <div
                      key={id}
                      className={`border rounded-xl p-4 flex flex-col md:flex-row items-start gap-4 transition duration-200 ${
                        isBusy ? "opacity-60 bg-gray-50" : "bg-white hover:shadow-md"
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="w-full md:w-28 h-20 bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaHome className="text-2xl text-gray-400" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800">{p.title}</div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          {p.city || p.place} •{" "}
                          <span className="font-mono text-xs">
                            ID: {p.refNumber || (p._id || "").slice(0, 8)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Seller: <span className="font-medium">{p.seller?.name || "Admin"}</span>
                        </div>
                      </div>

                      {/* Actions/Status */}
                      <div className="flex flex-col items-start md:items-end gap-2 mt-3 md:mt-0 md:pl-4 border-t md:border-t-0 md:border-l pt-3 md:pt-0 border-gray-100">
                        {p.agentNumber && (
                          <a
                            href={`tel:${p.agentNumber}`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Call Agent: {p.agentNumber}
                          </a>
                        )}
                        <div className="text-xs text-gray-400">
                          Submitted: {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString() : "-"}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button
                            disabled={isBusy}
                            onClick={() => approve(id)}
                            className="px-3 py-1 rounded-full bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition disabled:bg-gray-400"
                          >
                            {isBusy ? "Processing..." : "Approve"}
                          </button>
                          <button
                            disabled={isBusy}
                            onClick={() => reject(id)}
                            className="px-3 py-1 rounded-full border border-red-500 text-red-500 text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <Link
                            to={`/admin/properties/${id}`}
                            className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 transition"
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {stats.pending > 4 && (
                  <Link to="/admin/properties?status=pending" className="block w-full text-center py-2 text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 rounded-lg transition">
                    View All {stats.pending} Pending →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Recent properties + recent sellers */}
        <div className="space-y-6">
          {/* Recent properties */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaHome className="mr-2 text-blue-500" /> Recent Active Properties
            </h4>
            {recentProps.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No recent active properties.</div>
            ) : (
              <ul className="space-y-4">
                {recentProps.map((r) => (
                  <li key={r._id || r.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                    <div className="w-12 h-10 bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-md border">
                      {r.images?.[0] ? (
                        <img src={r.images[0]} alt={r.title} className="w-full h-full object-cover" />
                      ) : (
                        <FaHome className="text-lg text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800">{r.title}</div>
                      <div className="text-xs text-gray-500">{r.city} • {formatCurrency(r.price)}</div>
                    </div>
                    <Link to={`/admin/properties/${r._id || r.id}`} className="text-sm text-blue-600 hover:underline flex-shrink-0">
                      Open →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent sellers */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaUserTie className="mr-2 text-purple-500" /> Recent Sellers
            </h4>
            {recentSellers.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No sellers found.</div>
            ) : (
              <ul className="space-y-3">
                {recentSellers.map((s) => (
                  <li key={s._id} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-50 transition border-b last:border-b-0 border-gray-100">
                    <div>
                      <div className="font-semibold text-sm text-gray-800">{s.name}</div>
                      <div className="text-xs text-gray-500 break-all">{s.email}</div>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">
                      Joined: {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "-"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/admin/sellers" className="mt-4 block w-full text-center py-2 text-purple-600 hover:text-purple-700 font-semibold bg-purple-50 rounded-lg transition">
              Manage All Sellers →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
