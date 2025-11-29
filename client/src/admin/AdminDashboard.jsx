// src/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

/**
 * Enhanced Admin Dashboard
 * - Shows quick stats
 * - Lists pending approvals with inline Approve/Reject
 * - Shows recent properties and recent sellers
 *
 * Paste into src/admin/AdminDashboard.jsx
 */

function StatCard({ title, value, children }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow flex flex-col">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value ?? "-"}</div>
      {children && <div className="mt-3 text-xs text-gray-400">{children}</div>}
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
      // Attempt an aggregated stats endpoint (recommended). If you don't have it, we'll compute below.
      // const resStats = await API.get("/admin/stats");
      // setStats(resStats.data);

      // fallback: multiple calls to build stats
      const [pendingRes, activeRes, sellersRes] = await Promise.allSettled([
        API.get("/admin/properties/pending"),
        API.get("/properties?status=active"),
        API.get("/admin/sellers"),
      ]);

      const pendingData = pendingRes.status === "fulfilled" ? pendingRes.value.data : [];
      const activeData = activeRes.status === "fulfilled" ? activeRes.value.data : [];
      const sellersData = sellersRes.status === "fulfilled" ? sellersRes.value.data : [];

      // also get rejected count via quick call (if you have an endpoint /properties?status=rejected)
      let rejectedCount = 0;
      try {
        const rej = await API.get("/properties?status=rejected");
        rejectedCount = Array.isArray(rej.data) ? rej.data.length : 0;
      } catch (e) {
        // ignore if unavailable
      }

      const totalProps = (activeData.length || 0) + (pendingData.length || 0) + rejectedCount;
      const totalSellers = sellersData.length || 0;

      // recent properties (mix of active + pending limited)
      // fetch latest active props separately for recency
      let recent = [];
      try {
        const rp = await API.get("/properties?status=active");
        recent = Array.isArray(rp.data) ? rp.data.slice(0, 6) : [];
      } catch (e) {
        recent = [];
      }

      // Set state
      setStats({
        totalProperties: totalProps,
        active: activeData.length || 0,
        pending: pendingData.length || 0,
        rejected: rejectedCount,
        totalSellers,
        // rough new sellers in last 7 days (server would be better)
        newSellers7d: sellersData.filter((s) => {
          if (!s.createdAt) return false;
          const created = new Date(s.createdAt);
          const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
          return diffDays <= 7;
        }).length,
      });

      setPending(pendingData.slice(0, 6));
      setRecentProps(recent);
      setRecentSellers(sellersData.slice(0, 6));
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
      // update stats locally
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
    if (reason === null) return; // cancelled
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
      // naive: iterate pending list
      for (const p of pending) {
        markBusy(p._id, true);
        try { await API.put(`/admin/properties/${p._id}/approve`); } catch (e) { console.error("approve error", e); }
        markBusy(p._id, false);
      }
      // reload
      await fetchDashboard();
      alert("Bulk approve attempted. See counts above and refresh for latest.");
    } catch (err) {
      console.error(err);
      alert("Bulk approve failed");
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total properties" value={stats.totalProperties} />
        <StatCard title="Active" value={stats.active} />
        <StatCard title="Pending approvals" value={stats.pending}>
          <Link to="/admin/properties?status=pending" className="text-sm text-blue-600">Open pending list →</Link>
        </StatCard>
        <StatCard title="Rejected" value={stats.rejected} />
        <StatCard title="Total sellers" value={stats.totalSellers} />
        <StatCard title="New sellers (7d)" value={stats.newSellers7d} />
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <button onClick={fetchDashboard} className="px-4 py-2 border rounded">Refresh</button>
        <button onClick={bulkApproveAll} className="px-4 py-2 bg-green-600 text-white rounded">Approve all pending</button>
        <Link to="/admin/sellers" className="px-4 py-2 border rounded">Manage Sellers</Link>
        <Link to="/admin/properties/new" className="px-4 py-2 border rounded">Add Property</Link>
      </div>

      {/* Main area: Pending (left), Recent (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Pending approvals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pending approvals</h3>
              <div className="text-sm text-gray-500">{stats.pending} pending</div>
            </div>

            {pending.length === 0 ? (
              <div className="text-gray-500 mt-4">No pending properties right now.</div>
            ) : (
              <div className="mt-3 space-y-3">
                {pending.map((p) => {
                  const id = p._id || p.id;
                  return (
                    <div key={id} className="border rounded p-3 flex items-start gap-3">
                      <div className="w-20 h-16 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                        {p.images?.[0] ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" /> : <div className="text-xs text-gray-400">No image</div>}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-medium">{p.title}</div>
                            <div className="text-xs text-gray-500">ID: <span className="font-mono">{p.refNumber || (p._id || "").slice(0, 8)}</span></div>
                            <div className="text-xs text-gray-500">{p.city || p.place} • {p.seller?.name || "Admin"}</div>
                          </div>

                          <div className="text-right">
                            {p.agentNumber && <a href={`tel:${p.agentNumber}`} className="block text-sm text-blue-600 mb-2">{p.agentNumber}</a>}
                            <div className="text-xs text-gray-400">{p.submittedAt ? new Date(p.submittedAt).toLocaleString() : ""}</div>
                          </div>
                        </div>

                        <div className="mt-2 flex gap-2">
                          <button disabled={busyIds.has(id)} onClick={() => approve(id)} className="px-3 py-1 rounded bg-green-600 text-white text-sm">
                            {busyIds.has(id) ? "..." : "Approve"}
                          </button>
                          <button disabled={busyIds.has(id)} onClick={() => reject(id)} className="px-3 py-1 rounded border text-sm text-red-600">
                            Reject
                          </button>
                          <Link to={`/admin/properties/${id}`} className="px-3 py-1 rounded border text-sm">Open</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Optionally add an activity feed or alerts block here */}
        </div>

        {/* RIGHT: Recent properties + recent sellers */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Recent properties</h4>
            {recentProps.length === 0 ? <div className="text-gray-500">No recent properties</div> : (
              <ul className="space-y-2">
                {recentProps.map((r) => (
                  <li key={r._id || r.id} className="flex items-center gap-3">
                    <div className="w-12 h-10 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                      {r.images?.[0] ? <img src={r.images[0]} alt={r.title} className="w-full h-full object-cover" /> : <div className="text-xs text-gray-400">No image</div>}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{r.title}</div>
                      <div className="text-xs text-gray-500">{r.city} • ID: <span className="font-mono">{r.refNumber || (r._id || "").slice(0, 8)}</span></div>
                    </div>
                    <Link to={`/admin/properties/${r._id || r.id}`} className="text-sm text-blue-600">Open</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Recent sellers</h4>
            {recentSellers.length === 0 ? <div className="text-gray-500">No sellers</div> : (
              <ul className="space-y-2">
                {recentSellers.map((s) => (
                  <li key={s._id} className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-gray-500 break-all">{s.email}</div>
                    </div>
                    <div className="text-xs text-gray-400">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
