// src/seller/MyProperties.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

/* Small close icon */
const CloseIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
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

  // search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounceRef = useRef(null);
  const searchAbortRef = useRef(null);

  // delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [busyDelete, setBusyDelete] = useState(false);

  const fetchProps = async (opts = { serverSearch: null }) => {
    setLoading(true);
    try {
      // cancel any pending search request
      if (searchAbortRef.current) {
        try { searchAbortRef.current.abort(); } catch (e) {}
        searchAbortRef.current = null;
      }

      const qp = opts.serverSearch ? `?search=${encodeURIComponent(opts.serverSearch)}` : "";
      const res = await API.get(`/sellers/me/properties${qp}`);
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

  // client-side filtered list for instant UI response
  const filteredProperties = useMemo(() => {
    if (!searchQuery) return properties;
    const q = searchQuery.trim().toLowerCase();
    return properties.filter((p) => {
      return (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.refNumber && String(p.refNumber).toLowerCase().includes(q)) ||
        (p._id && String(p._id).toLowerCase().includes(q)) ||
        (p.place && p.place.toLowerCase().includes(q))
      );
    });
  }, [properties, searchQuery]);

  // debounced server-side search for queries >= 3 chars
  useEffect(() => {
    // clear previous debounce
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    const q = (searchQuery || "").trim();
    if (!q || q.length < 3) {
      // if cleared, reload base list to ensure up-to-date (optional)
      if (!q) fetchProps();
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const ac = new AbortController();
        searchAbortRef.current = ac;
        const res = await API.get(`/sellers/me/properties?search=${encodeURIComponent(q)}`, { signal: ac.signal });
        setProperties(res.data || []);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("server search error", err);
      } finally {
        setSearchLoading(false);
        searchAbortRef.current = null;
      }
    }, 350); // debounce 350ms

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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
      setProperties((prev) =>
        prev.filter((p) => (p._id || p.id) !== id)
      );
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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header – responsive like admin */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold">My Properties</h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          {/* SEARCH BAR */}
          <div className="flex items-center w-full sm:w-[420px] bg-white border rounded overflow-hidden">
            <input
              type="text"
              aria-label="Search properties"
              placeholder="Search by title, city, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm outline-none"
            />
            <div className="flex items-center px-2">
              {searchLoading ? (
                <svg className="w-5 h-5 animate-spin text-gray-500" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                  <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              ) : searchQuery ? (
                <button
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                  <circle cx="11" cy="11" r="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 ml-0 sm:ml-3">
            <button
              onClick={() => fetchProps({ serverSearch: "" })}
              className="px-4 py-2 border rounded bg-white text-sm hover:bg-gray-100"
            >
              Refresh
            </button>
            <button
              onClick={() => navigate("/seller/properties/new")}
              className="px-4 py-2 bg-black text-white rounded text-sm"
            >
              Add Property
            </button>
          </div>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="text-gray-500">
          {searchQuery ? "No properties match your search." : "You have no properties yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((p) => {
            const id = p._id || p.id;
            const img = p.images?.[0] || "";
            const price = p.totalPrice ?? p.price ?? null;
            const status = p.status || "active";

            const displayId =
              p.refNumber ||
              `PROP-${String(p.id || "").padStart(3, "0") || id}`;

            const uploaderName = p.seller?.name || "You";

            return (
              <div
                key={id}
                className="bg-white rounded-xl shadow border border-gray-100 flex flex-col overflow-hidden"
              >
                {/* image */}
                <div className="w-full h-36 sm:h-40 bg-gray-100 overflow-hidden">
                  {img ? (
                    <img
                      src={img}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">
                        {p.title}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">
                        {p.city || p.place || "-"},{" "}
                        {p.country || "-"}
                      </p>

                      <p className="text-[11px] text-gray-500 mt-1">
                        ID:{" "}
                        <span className="font-mono">
                          {displayId}
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Uploaded by:{" "}
                        <span className="font-semibold">
                          {uploaderName}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          status === "active"
                            ? "bg-green-100 text-green-800"
                            : status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {status}
                      </span>
                      {p.status === "rejected" &&
                        p.rejectionReason && (
                          <span className="text-[11px] text-red-600 max-w-[120px] text-right">
                            {p.rejectionReason}
                          </span>
                        )}
                    </div>
                  </div>

                  {price !== null && (
                    <p className="mt-2 font-semibold text-sm sm:text-base">
                      ₹ {Number(price).toLocaleString("en-IN")}
                    </p>
                  )}

                  {/* actions – wrap on mobile */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        navigate(`/seller/properties/${id}`)
                      }
                      className="px-3 py-1 border rounded text-xs sm:text-sm cursor-pointer hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(p)}
                      className="px-3 py-1 border rounded text-xs sm:text-sm text-red-600 cursor-pointer hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
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
                <span className="font-semibold">
                  "{deleteTarget.title}"
                </span>
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
