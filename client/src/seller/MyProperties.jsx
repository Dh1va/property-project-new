// src/seller/MyProperties.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

/* Reuse small modal like in admin */
const CloseIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
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

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [busyDelete, setBusyDelete] = useState(false);

  const fetchProps = async () => {
    setLoading(true);
    try {
      const res = await API.get("/sellers/me/properties");
      setProperties(res.data || []);
    } catch (err) {
      console.error("Failed to fetch seller properties", err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDeleteModal = (prop) => {
    setDeleteTarget(prop);
    setConfirmText("");
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setConfirmText("");
    setBusyDelete(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (!confirmText) {
      alert("Type 'DELETE' to confirm.");
      return;
    }
    if (confirmText !== "DELETE") {
      alert("To confirm deletion, you must type DELETE in uppercase.");
      return;
    }

    try {
      setBusyDelete(true);
      const id = deleteTarget._id || deleteTarget.id;
      await API.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((p) => (p._id || p.id) !== id));
      closeDeleteModal();
    } catch (err) {
      console.error("Delete failed", err);
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      setBusyDelete(false);
    }
  };

  if (loading) return <div className="p-6">Loading properties…</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Properties</h2>
        <div>
          <button
            onClick={() => navigate("/seller/properties/new")}
            className="px-4 py-2 bg-black text-white rounded cursor-pointer"
          >
            Add Property
          </button>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-gray-500">You have no properties yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {properties.map((p) => {
            const id = p._id || p.id;
            const img = p.images?.[0] || "";
            const price = p.totalPrice ?? p.price ?? null;

            const displayId =
              p.refNumber || `PROP-${String(p.id || "").padStart(3, "0") || id}`;

            // For seller dashboard, just show "You" or their name if populated
            const uploaderName = p.seller?.name || "You";

            return (
              <div key={id} className="bg-white p-4 rounded shadow flex flex-col">
                <div className="w-full h-40 mb-3 bg-gray-100 rounded overflow-hidden">
                  {img ? (
                    <img src={img} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                  <p className="text-sm text-gray-600">
                    {p.city || p.place || "-"}, {p.country || "-"}
                  </p>

                  {/* ID + uploader info */}
                  <p className="text-xs text-gray-500 mt-1">
                    ID: <span className="font-mono">{displayId}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Uploaded by: <span className="font-semibold">{uploaderName}</span>
                  </p>

                  <p className="mt-2 font-semibold">
                    {price !== null ? `₹ ${Number(price).toLocaleString()}` : "-"}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/seller/properties/${id}`)}
                    className="px-3 py-1 border rounded cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(p)}
                    className="px-3 py-1 border rounded text-red-600 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={closeDeleteModal}
        title="Delete Property"
      >
        <div className="space-y-3">
          <div className="text-sm">
            This will permanently delete your property
            {deleteTarget?.title ? (
              <>
                {" "}
                <span className="font-semibold">"{deleteTarget.title}"</span>
              </>
            ) : null}
            . This action cannot be undone.
          </div>
          <div className="text-sm">
            To confirm, type <strong>DELETE</strong> below.
          </div>
          <input
            className="w-full border p-2 rounded"
            placeholder="Type DELETE to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              disabled={busyDelete}
              onClick={confirmDelete}
              className="px-4 py-2 rounded bg-red-600 text-white"
            >
              {busyDelete ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={closeDeleteModal}
              className="px-3 py-2 border rounded"
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
