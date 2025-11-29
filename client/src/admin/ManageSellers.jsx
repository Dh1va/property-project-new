// src/admin/ManageSellers.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

/* icons converted to JSX */
const PhoneSVG = ({ className = "w-5 h-5 inline-block mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
);
const LocationSVG = ({ className = "w-5 h-5 inline-block mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-auto max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-600">
            <CloseIcon />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "?";
  return (
    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
      {initials}
    </div>
  );
}

export default function ManageSellers() {
  const navigate = useNavigate();

  // sellers list (active or deleted depending on tab)
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);

  // create/edit UI state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    phone: "",
    city: "",
    pincode: "",
    isActive: true,
  });
  const [busyCreate, setBusyCreate] = useState(false);
  const [createErr, setCreateErr] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editSeller, setEditSeller] = useState(null);
  const [busyEdit, setBusyEdit] = useState(false);
  const [editErr, setEditErr] = useState("");

  // delete flow state
  const [deletePending, setDeletePending] = useState({ id: null, mode: "soft" });
  const [busyDelete, setBusyDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // properties modal state
  const [propsModalOpen, setPropsModalOpen] = useState(false);
  const [propsForSeller, setPropsForSeller] = useState([]);
  const [propsLoading, setPropsLoading] = useState(false);
  const [activeSellerForProps, setActiveSellerForProps] = useState(null);
  const [propsBusyIds, setPropsBusyIds] = useState([]);

  // fetch sellers based on tab
  const fetchSellers = async () => {
    setLoading(true);
    try {
      const url = showDeleted ? "/admin/sellers/deleted" : "/admin/sellers";
      const res = await API.get(url);
      setSellers(res.data);
    } catch (err) {
      console.error("fetch sellers", err);
      alert("Failed to fetch sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [showDeleted]);

  /* ---------- Toggle active/inactive ---------- */
  const toggle = async (id, activate) => {
    setSellers((prev) => prev.map((s) => (s._id === id ? { ...s, isActive: activate } : s)));
    try {
      const res = await API.put(`/admin/sellers/${id}/activate`, { activate });
      if (!(res?.data?.success === true || (res.status >= 200 && res.status < 300))) {
        throw new Error(res?.data?.message || "Unexpected response");
      }
    } catch (err) {
      console.error("Activate toggle error:", err?.response?.status, err?.response?.data || err.message);
      setSellers((prev) => prev.map((s) => (s._id === id ? { ...s, isActive: !activate } : s)));
      alert(err?.response?.data?.message || err.message || "Failed to update seller status");
    }
  };

  /* ---------- CREATE handlers ---------- */
  const handleCreateChange = (e) => setCreateForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateErr("");
    if (!createForm.name || !createForm.email || !createForm.password) {
      setCreateErr("Name, email and password are required");
      return;
    }
    if (createForm.password !== createForm.confirmPassword) {
      setCreateErr("Passwords do not match");
      return;
    }

    try {
      setBusyCreate(true);
      const res = await API.post("/admin/sellers", createForm);
      if (res?.data?.success && res.data.seller) {
        setSellers((prev) => [res.data.seller, ...prev]);
        setShowCreate(false);
        setCreateForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          company: "",
          phone: "",
          city: "",
          pincode: "",
          isActive: true,
        });
      } else {
        await fetchSellers();
        setShowCreate(false);
      }
    } catch (err) {
      console.error(err);
      setCreateErr(err?.response?.data?.message || "Server error");
    } finally {
      setBusyCreate(false);
    }
  };

  /* ---------- EDIT handlers ---------- */
  const openEdit = (seller) => {
    setEditSeller({ ...seller, password: "", confirmPassword: "" });
    setEditErr("");
    setEditOpen(true);
  };

  const handleEditChange = (e) => setEditSeller((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditErr("");
    if (!editSeller.name || !editSeller.email) {
      setEditErr("Name and email are required");
      return;
    }
    if (editSeller.password && editSeller.password !== editSeller.confirmPassword) {
      setEditErr("Passwords do not match");
      return;
    }

    try {
      setBusyEdit(true);
      const payload = {
        name: editSeller.name,
        email: editSeller.email,
        company: editSeller.company,
        phone: editSeller.phone,
        city: editSeller.city,
        pincode: editSeller.pincode,
        isActive: !!editSeller.isActive,
      };
      if (editSeller.password) payload.password = editSeller.password;

      const res = await API.put(`/admin/sellers/${editSeller._id}`, payload);
      if (res?.data?.success) {
        setSellers((prev) => prev.map((s) => (s._id === editSeller._id ? res.data.seller : s)));
        setEditOpen(false);
      } else {
        setEditErr(res?.data?.message || "Update failed");
      }
    } catch (err) {
      console.error("edit error", err);
      setEditErr(err?.response?.data?.message || "Server error");
    } finally {
      setBusyEdit(false);
    }
  };

  /* ---------- DELETE handlers ---------- */
  const startDelete = (id) => {
    setDeletePending({ id, mode: "soft" });
    setConfirmText("");
  };
  const startHardDelete = (id) => {
    setDeletePending({ id, mode: "hard" });
    setConfirmText("");
  };
  const cancelDelete = () => {
    setDeletePending({ id: null, mode: "soft" });
    setConfirmText("");
    setBusyDelete(false);
  };

  const confirmDelete = async () => {
    if (!deletePending.id) return;
    const seller = sellers.find((s) => s._id === deletePending.id);
    if (!seller) return cancelDelete();

    if (deletePending.mode === "hard") {
      if (confirmText !== seller.email) {
        alert("Type seller email exactly to confirm hard delete.");
        return;
      }
    } else {
      if (!confirmText) {
        alert("Type 'DELETE' to confirm soft delete.");
        return;
      }
      if (confirmText !== "DELETE") {
        alert("Type DELETE (uppercase) to confirm.");
        return;
      }
    }

    try {
      setBusyDelete(true);
      const url = `/admin/sellers/${deletePending.id}` + (deletePending.mode === "hard" ? "?hard=true" : "");
      const res = await API.delete(url);
      if (res?.data?.success) {
        if (showDeleted) {
          await fetchSellers();
        } else {
          setSellers((prev) => prev.filter((s) => s._id !== deletePending.id));
        }
        cancelDelete();
      } else {
        alert(res?.data?.message || "Delete failed");
      }
    } catch (err) {
      console.error("delete error", err);
      alert(err?.response?.data?.message || "Server error");
    } finally {
      setBusyDelete(false);
    }
  };

  /* ---------- PROPERTIES modal + actions ---------- */
  const openPropertiesModal = async (seller) => {
    try {
      setActiveSellerForProps(seller);
      setPropsModalOpen(true);
      setPropsLoading(true);
      const res = await API.get(`/admin/sellers/${seller._id}/properties`);
      setPropsForSeller(res.data || []);
    } catch (err) {
      console.error("fetch seller properties error", err);
      alert(err?.response?.data?.message || "Failed to load properties");
      setPropsForSeller([]);
    } finally {
      setPropsLoading(false);
    }
  };

  const markPropBusy = (id, busy = true) => {
    setPropsBusyIds((prev) => (busy ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const softDeleteProperty = async (propertyId) => {
    if (!confirm("Soft-delete this property (hide it)?")) return;
    markPropBusy(propertyId, true);
    try {
      const res = await API.put(`/admin/properties/${propertyId}/soft-delete`);
      if (res?.data?.success) {
        setPropsForSeller((prev) => prev.map((p) => (p._id === propertyId ? res.data.property : p)));
      } else {
        throw new Error(res?.data?.message || "Soft-delete failed");
      }
    } catch (err) {
      console.error("soft-delete prop error", err);
      alert(err?.response?.data?.message || "Failed to soft-delete property");
    } finally {
      markPropBusy(propertyId, false);
    }
  };

  const restoreProperty = async (propertyId) => {
    if (!confirm("Restore this property (make it active)?")) return;
    markPropBusy(propertyId, true);
    try {
      const res = await API.put(`/admin/properties/${propertyId}/restore`);
      if (res?.data?.success) {
        setPropsForSeller((prev) => prev.map((p) => (p._id === propertyId ? res.data.property : p)));
      } else {
        throw new Error(res?.data?.message || "Restore failed");
      }
    } catch (err) {
      console.error("restore prop error", err);
      alert(err?.response?.data?.message || "Failed to restore property");
    } finally {
      markPropBusy(propertyId, false);
    }
  };

  const softDeleteAllPropertiesForSeller = async (sellerId) => {
    if (!confirm("Soft-delete all properties for this seller?")) return;
    try {
      await API.put(`/admin/sellers/${sellerId}/properties/soft-delete-all`);
      const res = await API.get(`/admin/sellers/${sellerId}/properties`);
      setPropsForSeller(res.data || []);
    } catch (err) {
      console.error("soft-delete-all error", err);
      alert(err?.response?.data?.message || "Failed to soft-delete all properties");
    }
  };

  const restoreAllPropertiesForSeller = async (sellerId) => {
    if (!confirm("Restore all properties for this seller?")) return;
    try {
      await API.put(`/admin/sellers/${sellerId}/properties/restore-all`);
      const res = await API.get(`/admin/sellers/${sellerId}/properties`);
      setPropsForSeller(res.data || []);
    } catch (err) {
      console.error("restore-all error", err);
      alert(err?.response?.data?.message || "Failed to restore all properties");
    }
  };

  /* ---------- RESTORE seller (from deleted list) ---------- */
  const restoreSeller = async (id) => {
    if (!confirm("Restore this seller and their properties?")) return;
    try {
      const res = await API.put(`/admin/sellers/${id}/restore`);
      if (res?.data?.success) {
        alert("Seller restored");
        await fetchSellers();
      } else {
        alert(res?.data?.message || "Restore failed");
      }
    } catch (err) {
      console.error("restore seller error", err);
      alert(err?.response?.data?.message || "Server error");
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{showDeleted ? "Deleted Sellers" : "All Sellers"}</h2>
          <div className="text-sm text-gray-500">
            {showDeleted
              ? "Sellers that were soft-deleted. You can restore or permanently delete."
              : "Active sellers. Soft-delete hides seller + their properties."}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 md:gap-3">
          <button
            onClick={() => {
              setShowCreate((s) => !s);
              setCreateErr("");
            }}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900 transition text-sm md:text-base"
          >
            {showCreate ? "Cancel" : "Create Seller"}
          </button>

          <button
            onClick={() => setShowDeleted((s) => !s)}
            className="px-3 py-2 border rounded text-sm hover:bg-gray-50"
          >
            {showDeleted ? "Show Active" : "Show Deleted"}
          </button>

          <button onClick={fetchSellers} className="px-3 py-2 border rounded text-sm hover:bg-gray-50">
            Refresh
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 bg-white p-4 rounded-lg shadow space-y-3">
          {createErr && <div className="text-sm text-red-600">{createErr}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              name="name"
              value={createForm.name}
              onChange={handleCreateChange}
              placeholder="Name"
              className="border p-2 rounded"
            />
            <input
              name="email"
              value={createForm.email}
              onChange={handleCreateChange}
              placeholder="Email"
              type="email"
              className="border p-2 rounded"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              name="phone"
              value={createForm.phone}
              onChange={handleCreateChange}
              placeholder="Phone"
              className="border p-2 rounded"
            />
            <input
              name="city"
              value={createForm.city}
              onChange={handleCreateChange}
              placeholder="City"
              className="border p-2 rounded"
            />
            <input
              name="pincode"
              value={createForm.pincode}
              onChange={handleCreateChange}
              placeholder="Pincode"
              className="border p-2 rounded"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              name="password"
              value={createForm.password}
              onChange={handleCreateChange}
              placeholder="Password"
              type="password"
              className="border p-2 rounded"
            />
            <input
              name="confirmPassword"
              value={createForm.confirmPassword}
              onChange={handleCreateChange}
              placeholder="Confirm Password"
              type="password"
              className="border p-2 rounded"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={createForm.isActive}
                onChange={(e) => setCreateForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              <span>Active</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button disabled={busyCreate} className="px-4 py-2 bg-green-600 text-white rounded">
              {busyCreate ? "Creating..." : "Create Seller"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setCreateErr("");
              }}
              className="px-3 py-2 border rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-gray-500">Loading sellers…</div>
        ) : sellers.length === 0 ? (
          <div className="text-gray-500">{showDeleted ? "No deleted sellers." : "No sellers yet."}</div>
        ) : (
          sellers.map((s) => (
            <div key={s._id} className="p-4 bg-white rounded-lg shadow flex flex-col sm:flex-row gap-4">
              <div className="flex-shrink-0">
                <Avatar name={s.name} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div>
                    <div className="text-base font-semibold text-gray-900">{s.name}</div>
                    <div className="text-sm text-gray-600 break-all">{s.email}</div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div
                      className={`inline-flex items-center px-2 py-1 text-sm rounded ${
                        s.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center min-w-[140px]">
                    <PhoneSVG className="w-5 h-5 inline-block mr-2 text-gray-500" />
                    <span className="truncate">{s.phone || "—"}</span>
                  </div>

                  <div className="flex items-center min-w-[160px]">
                    <LocationSVG className="w-5 h-5 inline-block mr-2 text-gray-500" />
                    <span className="truncate">
                      {s.city || "—"}
                      {s.pincode ? ` • ${s.pincode}` : ""}
                    </span>
                  </div>

                  {s.company && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="italic">Company:</span>&nbsp;
                      <span className="text-gray-700 ml-1 break-words">{s.company}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openEdit(s)}
                    className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => openPropertiesModal(s)}
                    className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    View Properties
                  </button>

                  {!showDeleted && (
                    <button
                      onClick={() => toggle(s._id, !s.isActive)}
                      className={`text-sm px-3 py-1 rounded ${
                        s.isActive ? "border" : "bg-blue-600 text-white"
                      }`}
                    >
                      {s.isActive ? "Deactivate" : "Activate"}
                    </button>
                  )}

                  {!showDeleted ? (
                    <>
                      <button
                        onClick={() => startDelete(s._id)}
                        className="text-sm px-3 py-1 border rounded text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => startHardDelete(s._id)}
                        className="text-sm px-3 py-1 border rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Hard Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => restoreSeller(s._id)}
                        className="text-sm px-3 py-1 border rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => startHardDelete(s._id)}
                        className="text-sm px-3 py-1 border rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Hard Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EDIT modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Seller">
        {editErr && <div className="text-sm text-red-600 mb-2">{editErr}</div>}
        {editSeller && (
          <form onSubmit={handleEditSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="name"
                value={editSeller.name || ""}
                onChange={handleEditChange}
                placeholder="Name"
                className="border p-2 rounded"
              />
              <input
                name="email"
                value={editSeller.email || ""}
                onChange={handleEditChange}
                placeholder="Email"
                type="email"
                className="border p-2 rounded"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="phone"
                value={editSeller.phone || ""}
                onChange={handleEditChange}
                placeholder="Phone"
                className="border p-2 rounded"
              />
              <input
                name="city"
                value={editSeller.city || ""}
                onChange={handleEditChange}
                placeholder="City"
                className="border p-2 rounded"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="pincode"
                value={editSeller.pincode || ""}
                onChange={handleEditChange}
                placeholder="Pincode"
                className="border p-2 rounded"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={!!editSeller.isActive}
                  onChange={(e) => setEditSeller((s) => ({ ...s, isActive: e.target.checked }))}
                />
                <span>Active</span>
              </label>
            </div>

            <div className="text-sm text-gray-500">Fill password fields only to reset password.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="password"
                value={editSeller.password || ""}
                onChange={handleEditChange}
                placeholder="New password (optional)"
                type="password"
                className="border p-2 rounded"
              />
              <input
                name="confirmPassword"
                value={editSeller.confirmPassword || ""}
                onChange={handleEditChange}
                placeholder="Confirm password"
                type="password"
                className="border p-2 rounded"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button disabled={busyEdit} className="px-4 py-2 bg-blue-600 text-white rounded">
                {busyEdit ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-3 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* PROPERTIES modal */}
      <Modal
        open={propsModalOpen}
        onClose={() => {
          setPropsModalOpen(false);
          setPropsForSeller([]);
          setActiveSellerForProps(null);
        }}
        title={`Properties — ${activeSellerForProps?.name || ""}`}
      >
        <div className="space-y-3">
          {propsLoading ? (
            <div className="text-gray-500">Loading properties…</div>
          ) : (
            <>
              {propsForSeller.length === 0 ? (
                <div className="text-sm text-gray-500">No properties found for this seller.</div>
              ) : (
                <div className="space-y-3">
                  {propsForSeller.map((p) => (
                    <div
                      key={p._id}
                      className="p-3 bg-gray-50 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.title || p._id}</div>
                        <div className="text-sm text-gray-600 truncate">
                          {p.location || p.address || ""}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Status: <span className="font-medium">{p.status || "active"}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {p.status !== "inactive" ? (
                          <button
                            disabled={propsBusyIds.includes(p._id)}
                            onClick={() => softDeleteProperty(p._id)}
                            className="px-2 py-1 text-sm border rounded text-red-600 hover:bg-red-50"
                          >
                            {propsBusyIds.includes(p._id) ? "..." : "Soft Delete"}
                          </button>
                        ) : (
                          <button
                            disabled={propsBusyIds.includes(p._id)}
                            onClick={() => restoreProperty(p._id)}
                            className="px-2 py-1 text-sm border rounded bg-green-600 text-white hover:bg-green-700"
                          >
                            {propsBusyIds.includes(p._id) ? "..." : "Restore"}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            // close modal and go to admin property edit page in SAME TAB
                            setPropsModalOpen(false);
                            setPropsForSeller([]);
                            setActiveSellerForProps(null);
                            navigate(`/admin/properties/${p._id}`);
                          }}
                          className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
                        >
                          Open
                        </button>

                        <button
                          onClick={async () => {
                            if (!confirm("Permanently delete this property? This is irreversible.")) return;
                            try {
                              const r = await API.delete(`/admin/properties/${p._id}`);
                              if (r?.data?.success) {
                                setPropsForSeller((prev) =>
                                  prev.filter((x) => x._id !== p._id)
                                );
                              } else alert(r?.data?.message || "Delete failed");
                            } catch (err) {
                              console.error("property hard delete", err);
                              alert(err?.response?.data?.message || "Delete failed");
                            }
                          }}
                          className="px-2 py-1 text-sm border rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Hard Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* bulk actions */}
          {activeSellerForProps && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => softDeleteAllPropertiesForSeller(activeSellerForProps._id)}
                className="px-3 py-1 text-sm border rounded text-red-600"
              >
                Soft-delete all
              </button>
              <button
                onClick={() => restoreAllPropertiesForSeller(activeSellerForProps._id)}
                className="px-3 py-1 text-sm border rounded bg-green-600 text-white"
              >
                Restore all
              </button>
              <div className="text-sm text-gray-500 ml-0 sm:ml-3">
                Bulk operations on this seller&apos;s properties.
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* DELETE confirmation modal */}
      <Modal
        open={!!deletePending.id}
        onClose={cancelDelete}
        title={deletePending.mode === "hard" ? "Hard Delete Seller" : "Delete Seller"}
      >
        <div className="space-y-3">
          {deletePending.mode === "hard" ? (
            <>
              <div className="text-sm text-red-700">
                Hard delete is irreversible. This will permanently remove the seller and related data. Type the seller&apos;s email to confirm.
              </div>
              <input
                className="w-full border p-2 rounded"
                placeholder="Type seller email to confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </>
          ) : (
            <>
              <div className="text-sm">
                Soft delete will deactivate the seller and hide their properties. To confirm soft-delete, type <strong>DELETE</strong> below.
              </div>
              <input
                className="w-full border p-2 rounded"
                placeholder="Type DELETE to confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              disabled={busyDelete}
              onClick={confirmDelete}
              className={`px-4 py-2 rounded ${
                deletePending.mode === "hard" ? "bg-red-600 text-white" : "bg-yellow-600 text-white"
              }`}
            >
              {busyDelete ? "Deleting..." : deletePending.mode === "hard" ? "Hard Delete" : "Delete"}
            </button>
            <button onClick={cancelDelete} className="px-3 py-2 border rounded">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
