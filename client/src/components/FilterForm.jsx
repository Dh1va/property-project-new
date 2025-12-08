import React, { useState, useRef } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import API from "../services/api";

const amenitiesList = [
  "2BHK",
  "3BHK",
   "Garden",
  "Pool",
  "Balcony",
  "Terrace",
  "Public Transit",
  "Elevator",
  "Parking",
  "Garage",
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

const FilterForm = ({ onFilter }) => {
  const initialFilters = {
    city: "",
    type: "",
    minBudget: "",
    maxBudget: "",
    minSqm: "",
    maxSqm: "",
    minRooms: "",
    maxRooms: "",
    newItem: false,
    amenities: [],
  };

  const [filters, setFilters] = useState(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 🔍 locations (city + pincode) suggestions from backend
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const toggleAmenity = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleErase = () => {
    setFilters(initialFilters);
    setLocationSuggestions([]);
    onFilter(initialFilters);
  };

  // 🔁 Fetch locations (city + pincode) from backend with debounce
  const fetchLocations = (value) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 1) {
      setLocationSuggestions([]);
      setLocationLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLocationLoading(true);
        const res = await API.get("/locations", {
          params: { search: trimmed },
        });
        setLocationSuggestions(res.data || []);
      } catch (err) {
        console.error("Location fetch failed", err);
        setLocationSuggestions([]);
      } finally {
        setLocationLoading(false);
      }
    }, 300);
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, city: value }));
    fetchLocations(value);
  };

  const handleLocationSelect = (item) => {
    // 👈 display ONLY the city name in the field
    setFilters((prev) => ({
      ...prev,
      city: item.city || "",
    }));
    setLocationSuggestions([]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-gray-50 p-6 rounded-2xl shadow-sm space-y-6"
    >
      {/* 🏙️ Row 1 — Place & Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Place with city + pincode autosuggest */}
        <div className="flex flex-col relative">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Place
          </label>
          <input
            type="text"
            placeholder="Enter city or postal code"
            value={filters.city}
            onChange={handleCityChange}
            className="border rounded-md p-2 w-full"
            autoComplete="off"
          />

          {/* Suggestions dropdown */}
          {filters.city && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-y-auto z-50">
              {/* Loading state */}
              {locationLoading && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  Searching…
                </div>
              )}

              {/* Results */}
              {!locationLoading && locationSuggestions.length > 0 && (
                <>
                  {locationSuggestions.map((item, idx) => {
                    const hasPostal = !!item.postalCode;
                    const label = hasPostal
                      ? `${item.postalCode} – ${item.city}`
                      : item.city || "";

                    return (
                      <div
                        key={`${item.postalCode}-${item.city}-${idx}`}
                        onClick={() => handleLocationSelect(item)}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                      >
                        {label}
                      </div>
                    );
                  })}
                </>
              )}

              {/* No results */}
              {!locationLoading && locationSuggestions.length === 0 && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No suggestions found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Type of Property */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Type of Property
          </label>
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value }))
            }
            className="border rounded-md p-2 w-full"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 💰 Row 2 — Budget, Sqm, Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Budget (Rs)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minBudget}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minBudget: e.target.value,
                }))
              }
              className="border rounded-md p-2 w-full"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxBudget}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxBudget: e.target.value,
                }))
              }
              className="border rounded-md p-2 w-full"
            />
          </div>
        </div>

        {/* Sq.m */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Sq. m.
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minSqm}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minSqm: e.target.value,
                }))
              }
              className="border rounded-md p-2 w-full"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxSqm}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxSqm: e.target.value,
                }))
              }
              className="border rounded-md p-2 w-full"
            />
          </div>
        </div>

        {/* Rooms */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Number of Rooms
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minRooms}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minRooms: e.target.value,
                }))
              }
              className="border rounded-md p-2 w-full"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxRooms}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxRooms: e.target.value,
                }))
              }
              className="border rounded-md p-2 w-full"
            />
          </div>
        </div>
      </div>

      {/* ✅ Row 3 — New Item + Seek */}
      <div className="flex flex-col gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <input
            type="checkbox"
            checked={filters.newItem}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                newItem: e.target.checked,
              }))
            }
          />
          New Item
        </label>

        <button
          type="submit"
          className="bg-black text-white w-full py-3 rounded-full cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-800 transition text-lg font-medium"
        >
          <Search className="w-5 h-5" />
          Seek
        </button>
      </div>

      {/* ⚙️ Advanced Search + Erase */}
      <div className="flex justify-between items-center mt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="text-sm flex items-center gap-2 text-gray-700 hover:text-black"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Advanced Search
        </button>

        <button
          type="button"
          onClick={handleErase}
          className="text-sm flex items-center gap-1 text-red-600 hover:text-red-700"
        >
          <X className="w-4 h-4" /> Erase
        </button>
      </div>

      {/* 🧩 Advanced Search Pills */}
      {showAdvanced && (
        <div className="mt-4 flex flex-wrap gap-2">
          {amenitiesList.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                filters.amenities.includes(a)
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-700 hover:border-black"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default FilterForm;
