// src/admin/ManageProperties.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

/* Small close icon */
const CloseIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/* Generic Modal wrapper */
function Modal({ open, onClose, children, title, maxW = "max-w-md" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`w-full ${maxW} bg-white rounded-lg shadow-lg overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-600" aria-label="Close dialog">
            <CloseIcon />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function ManageProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [busyDelete, setBusyDelete] = useState(false);

  // approve modal state
  const [approveTarget, setApproveTarget] = useState(null);
  const [approveNotifyMessage, setApproveNotifyMessage] = useState("");
  const [busyApprove, setBusyApprove] = useState(false);

  // reject modal state
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyReject, setBusyReject] = useState(false);

  // search + filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  /* ---------- fetch properties (combine pending + active) ---------- */
  const fetchProps = async () => {
    try {
      setLoading(true);
      // get pending (admin route) and active (public) and combine
      const pendingRes = await API.get("/admin/properties/pending").catch(() => ({ data: [] }));
      const activeRes = await API.get("/properties?status=active").catch(() => ({ data: [] }));
      const combined = [...(activeRes.data || []), ...(pendingRes.data || [])];

      // de-dupe by id
      const map = new Map();
      combined.forEach((p) => map.set(p._id || p.id, p));
      const allProps = Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setProperties(allProps);
    } catch (err) {
      console.error("Failed to fetch properties", err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProps(); }, []);

  /* ---------- helper getters ---------- */
  const getDisplayId = (p) => p.refNumber || `PROP-${String(p.id || "").padStart(3, "0") || (p._id || "")}`;
  const getUploaderName = (p) => p.seller?.name || p.uploaderName || "Admin";

  /* ---------- filters ---------- */
  const sellerOptions = (() => {
    const set = new Set();
    properties.forEach((p) => set.add(getUploaderName(p)));
    return Array.from(set).sort();
  })();

  const filteredProperties = properties.filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    let matchesSearch = true;
    if (q) {
      matchesSearch = (p.title || "").toLowerCase().includes(q) || getDisplayId(p).toLowerCase().includes(q);
    }
    let matchesSeller = sellerFilter === "all" || getUploaderName(p) === sellerFilter;
    let matchesStatus = statusFilter === "all" || (p.status || "active") === statusFilter;
    return matchesSearch && matchesSeller && matchesStatus;
  });

  useEffect(() => { setCurrentPage(1); }, [searchTerm, sellerFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / pageSize));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = filteredProperties.slice(startIndex, endIndex);

  /* ---------- delete flow ---------- */
  const openDeleteModal = (prop) => {
    setDeleteTarget(prop);
    setDeleteConfirmText("");
  };
  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteConfirmText("");
    setBusyDelete(false);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (!deleteConfirmText) { alert("Type 'DELETE' to confirm."); return; }
    if (deleteConfirmText !== "DELETE") { alert("Type DELETE (uppercase) to confirm."); return; }
    try {
      setBusyDelete(true);
      const id = deleteTarget._id || deleteTarget.id;
      await API.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((x) => (x._id || x.id) !== id));
      closeDeleteModal();
      alert("Property deleted");
    } catch (err) {
      console.error("Delete failed", err);
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      setBusyDelete(false);
    }
  };

  /* ---------- approve flow (with confirm dialog) ---------- */
  const openApproveModal = (prop) => {
    setApproveTarget(prop);
    setApproveNotifyMessage("");
  };
  const closeApproveModal = () => {
    setApproveTarget(null);
    setApproveNotifyMessage("");
    setBusyApprove(false);
  };
  const confirmApprove = async () => {
    if (!approveTarget) return;
    try {
      setBusyApprove(true);
      const id = approveTarget._id || approveTarget.id;
      // Call approve endpoint
      await API.put(`/admin/properties/${id}/approve`, { notifyMessage: approveNotifyMessage }).catch(() => API.put(`/admin/properties/${id}/approve`));
      setProperties((prev) => prev.map((p) => (p._id === id ? { ...p, status: "active", publishedAt: new Date() } : p)));
      closeApproveModal();
      alert("Property approved and published");
    } catch (err) {
      console.error("Approve failed", err);
      alert(err?.response?.data?.message || "Approve failed");
    } finally {
      setBusyApprove(false);
    }
  };

  /* ---------- reject flow ---------- */
  const openRejectModal = (prop) => {
    setRejectTarget(prop);
    setRejectReason("");
  };
  const closeRejectModal = () => {
    setRejectTarget(null);
    setRejectReason("");
    setBusyReject(false);
  };
  const confirmReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { alert("Provide a reason for rejection."); return; }
    try {
      setBusyReject(true);
      const id = rejectTarget._id || rejectTarget.id;
      await API.put(`/admin/properties/${id}/reject`, { reason: rejectReason });
      setProperties((prev) => prev.map((p) => (p._id === id ? { ...p, status: "rejected", rejectionReason: rejectReason } : p)));
      closeRejectModal();
      alert("Property rejected");
    } catch (err) {
      console.error("Reject failed", err);
      alert(err?.response?.data?.message || "Reject failed");
    } finally {
      setBusyReject(false);
    }
  };

  if (loading) return <div className="p-6">Loading properties…</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Manage Properties</h2>
        <div className="flex gap-2">
          <button onClick={() => navigate("/admin/properties/new")} className="px-4 py-2 bg-black text-white rounded">Add Property</button>
          <button onClick={fetchProps} className="px-3 py-2 border rounded">Refresh</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by ID or name..." className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>

        <div className="w-full md:w-48">
          <select value={sellerFilter} onChange={(e) => setSellerFilter(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white">
            <option value="all">All uploaders</option>
            {sellerOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="w-full md:w-40">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Counts */}
      <div className="text-xs text-gray-500 mb-3">
        Showing {filteredProperties.length} of {properties.length} properties — Page {currentPage} of {totalPages}
      </div>

      {/* Grid */}
      {filteredProperties.length === 0 ? (
        <div className="text-gray-500">No properties match your search/filter.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {pageItems.map((p) => {
              const id = p._id || p.id;
              const firstImg = p.images?.[0] || "";
              const price = p.totalPrice ?? p.price ?? null;
              const displayId = getDisplayId(p);
              const uploaderName = getUploaderName(p);

              return (
                <div key={id} className="bg-white rounded shadow flex flex-col overflow-hidden">
                  <div className="w-full h-40 bg-gray-100 overflow-hidden">
                    {firstImg ? <img src={firstImg} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>}
                  </div>

                  <div className="flex-1 flex flex-col p-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold">{p.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : p.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {p.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">{p.city || p.place || "-"}, {p.country || "-"}</p>
                      <p className="text-xs text-gray-500 mt-1">ID: <span className="font-mono">{displayId}</span></p>
                      <p className="text-xs text-gray-500">Uploaded by: <span className="font-semibold">{uploaderName}</span></p>
                      <p className="mt-2 font-semibold">{price !== null ? `Rs ${Number(price).toLocaleString()}` : "-"}</p>

                      {p.agentNumber && (
                        <div className="text-sm mt-2">For enquiries: <a href={`tel:${p.agentNumber}`} className="font-semibold">{p.agentNumber}</a></div>
                      )}

                      {p.status === "rejected" && p.rejectionReason && (
                        <div className="text-xs text-red-600 mt-2">Rejection: {p.rejectionReason}</div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button onClick={() => navigate(`/admin/properties/${id}`)} className="px-3 py-1 border rounded">Edit</button>

                      {p.status === "pending" ? (
                        <>
                          <button onClick={() => openApproveModal(p)} className="px-3 py-1 border rounded bg-green-600 text-white">Approve</button>
                          <button onClick={() => openRejectModal(p)} className="px-3 py-1 border rounded text-red-600">Reject</button>
                        </>
                      ) : (
                        <button onClick={() => openDeleteModal(p)} className="px-3 py-1 border rounded text-red-600">Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className={`px-3 py-1 border rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}>Previous</button>
              <span>Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span></span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className={`px-3 py-1 border rounded ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}>Next</button>
            </div>
          )}
        </>
      )}

      {/* ---------- Delete Modal ---------- */}
      <Modal open={!!deleteTarget} onClose={closeDeleteModal} title="Delete Property">
        <div className="space-y-3">
          <div className="text-sm">
            This will permanently delete the property {deleteTarget?.title ? <span className="font-semibold">"{deleteTarget.title}"</span> : null}. This action cannot be undone.
          </div>
          <div className="text-sm">To confirm, type <strong>DELETE</strong> below.</div>
          <input className="w-full border p-2 rounded" placeholder="Type DELETE to confirm" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />
          <div className="flex items-center gap-3 mt-2">
            <button disabled={busyDelete} onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 text-white">{busyDelete ? "Deleting..." : "Delete"}</button>
            <button onClick={closeDeleteModal} className="px-3 py-2 border rounded">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ---------- Approve Modal ---------- */}
      <Modal open={!!approveTarget} onClose={closeApproveModal} title="Approve Property">
        <div className="space-y-3">
          <div>
            <div className="text-sm">You're approving <span className="font-semibold">{approveTarget?.title}</span>. This will make the property live on the site.</div>
            <div className="text-xs text-gray-500 mt-1">Optionally send a short message to the seller (notification/email) about the approval.</div>
          </div>

          <textarea value={approveNotifyMessage} onChange={(e) => setApproveNotifyMessage(e.target.value)} placeholder="Optional message to seller (e.g. 'Approved and published — thanks')" className="w-full border p-2 rounded min-h-[80px]" />

          <div className="flex items-center gap-3 mt-2">
            <button disabled={busyApprove} onClick={confirmApprove} className="px-4 py-2 rounded bg-green-600 text-white">{busyApprove ? "Approving..." : "Approve & Publish"}</button>
            <button onClick={closeApproveModal} className="px-3 py-2 border rounded">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ---------- Reject Modal ---------- */}
      <Modal open={!!rejectTarget} onClose={closeRejectModal} title="Reject Property">
        <div className="space-y-3">
          <div>
            <div className="text-sm">You're rejecting <span className="font-semibold">{rejectTarget?.title}</span></div>
            <div className="text-xs text-gray-500">The seller will receive the reason and can edit & resubmit.</div>
          </div>

          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Write rejection reason (shown to seller)" className="w-full border p-2 rounded min-h-[100px]" />

          <div className="flex items-center gap-3 mt-2">
            <button disabled={busyReject} onClick={confirmReject} className="px-4 py-2 rounded bg-red-600 text-white">{busyReject ? "Rejecting..." : "Reject"}</button>
            <button onClick={closeRejectModal} className="px-3 py-2 border rounded">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
