// src/shared/PropertyForm.jsx
import React, { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { useNavigate, useParams } from "react-router-dom";

/**
 * PropertyForm with reorderable images (drag & drop)
 *
 * - combinedImages: array of { id, type: 'existing'|'new', url, file? }
 * - Drag to reorder items in combinedImages
 * - Remove items (existing or new)
 * - On submit: send existingImages (comma separated, in order) + append new files (in order)
 */

export default function PropertyForm({ redirectTo = "/admin/properties" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [clientError, setClientError] = useState("");

  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const [form, setForm] = useState({
    title: "",
    totalPrice: "",
    squareMeters: "",
    zip: "",
    place: "",
    city: "",
    country: "",
    rooms: "",
    bathrooms: "",
    type: "",         // string for selected type
    amenities: [],    // now an array of strings
    description: "",
    agentNumber: "",  // <-- added
  });

  // combinedImages holds both existing and newly selected files in the order displayed
  // { id: string, type: 'existing'|'new', url: string, file?: File }
  const [combinedImages, setCombinedImages] = useState([]);
  const createdObjectUrlsRef = useRef(new Set());
  const dragIndexRef = useRef(null);

  // Amenity options (you can change order or add/remove)
  const AMENITY_OPTIONS = [
    "2BHK",
    "3BHK",
    "garden",
    "pool",
    "parking",
    "public transit",
    "garage",
    "elevator",
    "balcony",
    "terrace",
    "train",
  ];

  // Keep these in sync with your category types / backend property types
  const PROPERTY_TYPES = [
    "Agriland",
    "Apartment",
    "Commercial Building",
    "Commercial Land",
    "Houseplot",
    "Land",
    "Office",
    "Residential",
    "Retail",
    "Villa",
  ];

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      createdObjectUrlsRef.current.forEach((u) => {
        try { URL.revokeObjectURL(u); } catch (e) {}
      });
      createdObjectUrlsRef.current.clear();
    };
  }, []);

  // Load property when editing
  useEffect(() => {
    if (!id) {
      setCombinedImages([]);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await API.get(`/properties/${id}`);
        const p = res.data;

        setForm({
          title: p.title || "",
          totalPrice: p.totalPrice ?? "",
          squareMeters: p.squareMeters ?? "",
          zip: p.zip || "",
          place: p.place || "",
          city: p.city || "",
          country: p.country || "",
          rooms: p.rooms ?? "",
          bathrooms: p.bathrooms ?? "",
          type: p.type || "",
          // ensure amenities is an array
          amenities: Array.isArray(p.amenities) ? p.amenities : (p.amenities ? String(p.amenities).split(/\s*,\s*/).filter(Boolean) : []),
          description: p.description || "",
          agentNumber: p.agentNumber || "", // <-- load agentNumber
        });

        const existing = (p.images || []).map((url, i) => ({
          id: `existing-${i}-${Math.random().toString(36).slice(2, 9)}`,
          type: "existing",
          url,
        }));
        setCombinedImages(existing);
      } catch (err) {
        console.error(err);
        setServerError("Failed to load property");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // Amenity toggle
  const handleAmenityToggle = (amenity) => {
    setForm((s) => {
      const set = new Set(s.amenities || []);
      if (set.has(amenity)) set.delete(amenity);
      else set.add(amenity);
      return { ...s, amenities: Array.from(set) };
    });
  };

  // Accept either FileList or Array<File>
  const addFiles = (filesLike) => {
    setClientError("");
    if (!filesLike) return;
    const files = Array.from(filesLike).filter((f) => f && f.type && f.type.startsWith("image/"));
    if (!files.length) return;

    const currentCount = combinedImages.length;
    const totalCount = currentCount + files.length;
    if (totalCount > MAX_FILES) {
      setClientError(`Please select up to ${MAX_FILES} images (you have ${currentCount}, selected ${files.length}).`);
      return;
    }

    const tooLarge = files.find((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge) {
      setClientError(`Each file must be ≤ ${Math.round(MAX_FILE_SIZE / (1024 * 1024))} MB. "${tooLarge.name}" is too large.`);
      return;
    }

    // map files to combined entries, create object URLs
    const now = Date.now();
    const newEntries = files.map((file, i) => {
      const url = URL.createObjectURL(file);
      createdObjectUrlsRef.current.add(url);
      return {
        id: `new-${now}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        type: "new",
        url,
        file,
      };
    });

    setCombinedImages((prev) => [...prev, ...newEntries]);
  };

  // Input change
  const onInputFiles = (e) => {
    const files = e.target.files;
    if (!files || !files.length) {
      // Reset input value anyway so future same-file selection triggers change
      e.target.value = "";
      return;
    }
    addFiles(files);
    // reset value so selecting same files again triggers change
    e.target.value = "";
  };

  // drop
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (!dt) return;
    const files = Array.from(dt.files || []).filter((f) => f.type && f.type.startsWith("image/"));
    if (files.length) addFiles(files);
  };

  const removeItem = (id) => {
    const item = combinedImages.find((c) => c.id === id);
    if (item?.type === "new" && item.url) {
      try { URL.revokeObjectURL(item.url); } catch (e) {}
      createdObjectUrlsRef.current.delete(item.url);
    }
    setCombinedImages((prev) => prev.filter((c) => c.id !== id));
    setClientError("");
  };

  // Drag & drop reorder
  const onDragStart = (e, index) => {
    dragIndexRef.current = index;
    try {
      const img = e.currentTarget.querySelector("img");
      if (img) e.dataTransfer.setDragImage(img, 10, 10);
    } catch (err) {}
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDropReorder = (e, index) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    const to = index;
    if (from == null || to == null || from === to) return;
    setCombinedImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    dragIndexRef.current = null;
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const validateBeforeSubmit = () => {
    if (!form.title?.trim()) return "Title is required";
    if (!form.city?.trim()) return "City is required";
    if (!form.totalPrice && !(form.totalPrice === 0)) return "Price is required";
    if (!form.description?.trim()) return "Description is required";
    return "";
  };

  // Build FormData preserving order
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setServerError("");
    setClientError("");

    const vMsg = validateBeforeSubmit();
    if (vMsg) {
      setClientError(vMsg);
      setSaving(false);
      return;
    }

    try {
      const data = new FormData();

      for (const key of [
        "title",
        "totalPrice",
        "squareMeters",
        "zip",
        "place",
        "city",
        "country",
        "rooms",
        "bathrooms",
        "type",
        "description",
        "agentNumber", // <-- include agentNumber
      ]) {
        data.append(key, form[key] ?? "");
      }

      // amenities should be sent as comma-separated string (existing backend expectation)
      data.append("amenities", (form.amenities || []).join(", "));

      // preserve order: existing urls and new files
      const existingUrls = [];
      const newFilesInOrder = [];
      combinedImages.forEach((entry) => {
        if (entry.type === "existing") existingUrls.push(entry.url);
        else if (entry.type === "new" && entry.file) newFilesInOrder.push(entry.file);
      });

      if (id) {
        data.append("existingImages", existingUrls.join(","));
      }

      newFilesInOrder.forEach((file) => data.append("images", file));

      if (id) {
        await API.put(`/properties/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/properties", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate(redirectTo);
    } catch (err) {
      console.error("Save error:", err);
      setServerError(err?.response?.data?.message || "Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  const totalImagesCount = combinedImages.length;
  const remainingSlots = Math.max(0, MAX_FILES - totalImagesCount);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded shadow">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-4 text-sm px-3 py-2 border rounded hover:bg-gray-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" className="inline-block">
            <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        <h2 className="text-xl font-semibold mb-4">{id ? "Edit Property" : "Add Property"}</h2>

        {serverError && <p className="text-red-600 mb-3">{serverError}</p>}
        {clientError && <p className="text-red-600 mb-3">{clientError}</p>}

        {loading ? (
          <p>Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-sm">Title</label>
              <input className="border p-2 rounded w-full" name="title" value={form.title} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-sm">Price</label>
                <input name="totalPrice" value={form.totalPrice} onChange={handleChange} className="border p-2 rounded w-full" />
              </div>
              <div>
                <label className="block font-medium text-sm">Size (sqm)</label>
                <input name="squareMeters" value={form.squareMeters} onChange={handleChange} className="border p-2 rounded w-full" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="border p-2 rounded w-full" />
              <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className="border p-2 rounded w-full" />
              <input name="zip" value={form.zip} onChange={handleChange} placeholder="ZIP" className="border p-2 rounded w-full" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input name="rooms" value={form.rooms} onChange={handleChange} placeholder="Rooms" className="border p-2 rounded w-full" />
              <input name="bathrooms" value={form.bathrooms} onChange={handleChange} placeholder="Bathrooms" className="border p-2 rounded w-full" />
              {/* Type -> SELECT */}
              <div className="relative">
                <label className="block font-medium text-sm sr-only">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleSelectChange}
                  className="border p-2 rounded w-full appearance-none pr-10"
                >
                  <option value="">All Types</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>))}
                </select>
                {/* Chevron icon positioned so it doesn't touch border */}
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* Agent Number input (new) */}
            <div>
              <label className="block font-medium text-sm">Agent Number</label>
              <input
                name="agentNumber"
                value={form.agentNumber}
                onChange={handleChange}
                placeholder="Phone number for enquiries (e.g. +91 9XXXXXXXXX)"
                className="border p-2 rounded w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Visible on property cards and used for telephone enquiries.</p>
            </div>

            {/* Amenities as checkboxes */}
            <div>
              <label className="block text-sm font-medium mb-2">Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITY_OPTIONS.map((opt) => {
                  const idKey = `amenity-${opt.replace(/\s+/g, "-")}`;
                  const checked = (form.amenities || []).includes(opt);
                  return (
                    <label key={opt} htmlFor={idKey} className="inline-flex items-center gap-2 text-sm">
                      <input
                        id={idKey}
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleAmenityToggle(opt)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="capitalize">{opt}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Select applicable amenities</p>
            </div>

            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full border p-2 rounded h-28" />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Images <span className="text-xs text-gray-500">({totalImagesCount}/{MAX_FILES})</span>
              </label>

              <div
                role="button"
                tabIndex={0}
                onClick={() => (remainingSlots > 0 ? fileInputRef.current.click() : null)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && remainingSlots > 0) {
                    e.preventDefault();
                    fileInputRef.current.click();
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className={`cursor-pointer border-2 border-dashed rounded-lg p-3 mb-3 transition ${remainingSlots > 0 ? "hover:bg-gray-50 border-gray-300" : "opacity-60 cursor-not-allowed border-gray-200"}`}
                aria-label="Choose or drop images"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 5v14M5 12h14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  <div className="text-start">
                    <div className="font-medium text-sm text-black">{remainingSlots > 0 ? "Click or drag to add images" : "Max images reached"}</div>
                    <div className="text-xs text-gray-500">PNG, JPG, WEBP — up to {MAX_FILES} files · max {Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB each</div>
                  </div>
                </div>
              </div>

              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={onInputFiles} className="hidden" />

              {/* Previews */}
              {combinedImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {combinedImages.map((entry, idx) => (
                    <div
                      key={entry.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDrop={(e) => onDropReorder(e, idx)}
                      className="relative rounded overflow-hidden border"
                    >
                      <img src={entry.url} alt={entry.id} className="w-full h-28 object-cover" />
                      <div className="absolute left-2 top-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {entry.type === "existing" ? "Existing" : "New"}
                      </div>

                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => removeItem(entry.id)}
                          className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>

                      <div className="absolute left-2 bottom-2 bg-white/80 px-2 py-1 rounded text-xs text-gray-700">Drag</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No images selected</p>
              )}
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-black text-white rounded">
                {saving ? "Saving…" : id ? "Update Property" : "Add Property"}
              </button>

              <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
