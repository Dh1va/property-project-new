// src/admin/AdminEnquiries.jsx
import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../components/AuthContext";

/* Simple reusable modal */
function ConfirmModal({ open, title, message, onCancel, onConfirm, busy }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg">
        <div className="px-4 py-3 border-b">
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        <div className="px-4 py-4 text-sm text-gray-700">{message}</div>
        <div className="px-4 py-3 flex justify-end gap-2 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm border rounded"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm rounded bg-red-600 text-white"
            disabled={busy}
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEnquiries() {
  const { token } = useContext(AuthContext) || {};
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // id being deleted
  const [error, setError] = useState("");
  const [copiedFor, setCopiedFor] = useState(null);

  // delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // enquiry object

  const fetchEnquiries = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/enquiry");
      setEnquiries(res.data || []);
    } catch (err) {
      console.error("fetch enquiries error:", err);
      setError(err?.response?.data?.message || "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleDeleteClick = (enquiry) => {
    setDeleteTarget(enquiry);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleting(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?._id) return;
    const id = deleteTarget._id;
    setDeleting(id);
    try {
      await API.delete(`/enquiry/${id}`);
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
      closeDeleteModal();
    } catch (err) {
      console.error("delete error:", err);
      alert("Failed to delete");
      setDeleting(null);
    }
  };

  const handleCopy = async (enquiryId, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedFor(enquiryId);
      setTimeout(() => setCopiedFor(null), 1500);
    } catch (err) {
      console.error("clipboard error:", err);
      alert("Could not copy to clipboard");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-semibold mb-4">Enquiries</h1>

      {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : enquiries.length === 0 ? (
        <div className="text-gray-500">No enquiries found.</div>
      ) : (
        <>
          {/* ---------- MOBILE LAYOUT (STACKED CARDS) ---------- */}
          <div className="block md:hidden space-y-3">
            {enquiries.map((q) => {
              const propertyTitle = q.property?.title || q.propertyTitle || "–";
              const propertyRef = q.property?.refNumber || q.propertyRef || "";
              const propertyId = q.property?._id || "";
              const copyVal = propertyRef || propertyId;

              return (
                <div
                  key={q._id}
                  className="border rounded p-3 text-sm bg-white"
                >
                  {/* TOP Row: enquiry ref + date */}
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span className="font-mono">{q.refNumber}</span>
                    <span>
                      {q.createdAt
                        ? new Date(q.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>

                  {/* Property + IDs */}
                  <div className="mt-2 space-y-1">
                    <div>
                      <span className="font-semibold">Property: </span>
                      {propertyTitle}
                    </div>

                    {propertyRef && (
                      <div className="text-[11px] text-gray-700">
                        <span className="font-semibold">Property Ref: </span>
                        <span className="font-mono">{propertyRef}</span>
                      </div>
                    )}

                    {propertyId && (
                      <div className="text-[11px] text-gray-700">
                        <span className="font-semibold">Property ID: </span>
                        <span className="font-mono break-all">
                          {propertyId}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t my-2" />

                  {/* Contact + message */}
                  <div className="space-y-1 text-gray-700">
                    <div>
                      <span className="font-semibold">Name: </span>
                      {q.name}
                    </div>
                    <div className="break-all">
                      <span className="font-semibold">Email: </span>
                      {q.email}
                    </div>
                    <div>
                      <span className="font-semibold">Phone: </span>
                      {q.phone || "-"}
                    </div>
                    <div className="break-words">
                      <span className="font-semibold">Message: </span>
                      {q.message}
                    </div>
                  </div>

                  {/* Actions row: Copy + Delete */}
                  <div className="pt-3 flex items-center justify-end gap-2">
                    {copyVal && (
                      <button
                        className="px-3 py-1.5 text-xs border rounded"
                        onClick={() => handleCopy(q._id, copyVal)}
                      >
                        {copiedFor === q._id ? "Copied!" : "Copy ID"}
                      </button>
                    )}
                    <button
                      className="px-3 py-1.5 text-xs bg-red-600 text-white rounded"
                      onClick={() => handleDeleteClick(q)}
                      disabled={deleting === q._id}
                    >
                      {deleting === q._id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------- DESKTOP TABLE ---------- */}
          <div className="hidden md:block overflow-auto bg-white rounded shadow mt-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-3 py-2 text-left">Enquiry Ref</th>
                  <th className="px-3 py-2 text-left">Property Ref</th>
                  <th className="px-3 py-2 text-left">Property</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th className="px-3 py-2 text-left">Message</th>
                  <th className="px-3 py-2 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {enquiries.map((q) => {
                  const propertyTitle =
                    q.property?.title || q.propertyTitle || "–";
                  const propertyRef =
                    q.property?.refNumber || q.propertyRef || "";
                  const propertyId = q.property?._id || "";
                  const copyVal = propertyRef || propertyId;

                  return (
                    <React.Fragment key={q._id}>
                      {/* Main row */}
                      <tr className="">
                        {/* Enquiry ref */}
                        <td className="px-3 py-2 font-mono align-top">
                          {q.refNumber}
                        </td>

                        {/* Property ref column */}
                        <td className="px-3 py-2 align-top">
                          {propertyRef ? (
                            <span className="font-mono">{propertyRef}</span>
                          ) : (
                            <span className="text-gray-400">–</span>
                          )}
                        </td>

                        {/* Property title + (optional) ID small text */}
                        <td className="px-3 py-2 align-top">
                          <div>{propertyTitle}</div>
                          {propertyId && (
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              ID:{" "}
                              <span className="font-mono break-all">
                                {propertyId}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-2 align-top">{q.name}</td>
                        <td className="px-3 py-2 break-all align-top">
                          {q.email}
                        </td>
                        <td className="px-3 py-2 align-top">
                          {q.phone || "-"}
                        </td>
                        <td className="px-3 py-2 max-w-sm break-words align-top">
                          {q.message}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap align-top">
                          {q.createdAt
                            ? new Date(q.createdAt).toLocaleString()
                            : ""}
                        </td>
                      </tr>

                      <tr>
  <td className="px-3 py-3 border-b border-gray-200" colSpan={8}>
    <div className="flex justify-start gap-3">
      {copyVal && (
        <button
          onClick={() => handleCopy(q._id, copyVal)}
          className="px-2 py-1 border rounded text-xs md:text-sm hover:bg-gray-50"
        >
          {copiedFor === q._id ? "Copied!" : "Copy ID"}
        </button>
      )}

      <button
        className="px-2 py-1 text-xs md:text-sm bg-red-600 text-white rounded hover:bg-red-700"
        onClick={() => handleDeleteClick(q)}
        disabled={deleting === q._id}
      >
        {deleting === q._id ? "Deleting…" : "Delete"}
      </button>
    </div>
  </td>
</tr>


                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DELETE CONFIRM MODAL */}
          <ConfirmModal
            open={!!deleteTarget}
            title="Delete enquiry"
            message={
              deleteTarget
                ? `Are you sure you want to delete enquiry "${deleteTarget.refNumber}"? This cannot be undone.`
                : ""
            }
            onCancel={closeDeleteModal}
            onConfirm={handleDeleteConfirm}
            busy={!!deleting}
          />
        </>
      )}
    </div>
  );
}
