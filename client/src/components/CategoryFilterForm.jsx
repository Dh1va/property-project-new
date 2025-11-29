import React, { useState, useRef } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import API from "../services/api";

const amenitiesList = [
  "Garden",
  "Pool",
  "Balcony",
  "Terrace",
  "Public Transit",
  "Elevator",
  "Parking",
  "Garage",
  "2 BHK",
  "3 BHK",
];

const formatIndian = (num) => {
  if (num === null || num === undefined || num === "") return "";
  return Number(num).toLocaleString("en-IN");
};

const unformatNumber = (num) => (num ? num.replace(/\D/g, "") : "");

export default function CategoryFilterForm({ onFilter }) {
  const initialFilters = {
    city: "",
    rooms: "",
    amenities: [],
    maxPrice: 0, // MUST BE NUMBER
  };

  const [filters, setFilters] = useState(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setLocationSuggestions([]);
    onFilter(initialFilters);
  };

  const fetchLocations = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 1) {
      setLocationSuggestions([]);
      setLocationLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLocationLoading(true);
        const res = await API.get("/locations", { params: { search: trimmed } });
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

  const toggleAmenity = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-4 rounded-2xl space-y-4">
      {/* TOP ROW */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">

        {/* CITY */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="City or postal code"
            value={filters.city}
            onChange={handleCityChange}
            className="w-full border rounded-full px-4 py-2 h-10 text-sm md:text-base pr-10"
            autoComplete="off"
          />
        </div>

        {/* ROOMS */}
        <div className="w-full md:w-28">
          <input
            type="number"
            min="0"
            placeholder="Rooms"
            value={filters.rooms}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, rooms: e.target.value }))
            }
            className="border rounded-full px-4 py-2 h-10 w-full text-sm md:text-base"
          />
        </div>

        {/* PRICE SECTION */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3">

            {/* RUPEE TEXT INPUT */}
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                ₹
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Max"
                value={formatIndian(filters.maxPrice)}
                onChange={(e) => {
                  const numeric = Number(unformatNumber(e.target.value)) || 0;
                  setFilters((prev) => ({ ...prev, maxPrice: numeric }));
                }}
                className="border rounded-full pl-7 pr-3 py-2 h-10 w-full text-xs md:text-sm"
              />
            </div>

            {/* SLIDER */}
            <div className="flex-1 md:max-w-xs">
              <input
                type="range"
                min={0}
                max={10000000}
                step={5000}
                value={filters.maxPrice}
                placeholder="Max price"
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxPrice: Number(e.target.value),
                  }))
                }
                className="w-full accent-black cursor-pointer mt-1"
              />

              <div className="flex justify-between text-[11px] text-gray-500 px-2 mt-0.5">
                <span>₹0</span>
                <span>₹1,00,00,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center justify-end gap-2 md:gap-3 md:ml-4">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-full border px-3 py-2 h-10 text-sm hover:bg-gray-100 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Advanced</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center justify-center rounded-full border px-3 py-2 h-10 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <X className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-black text-white p-2.5 h-10 w-10 hover:bg-gray-800 cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ADVANCED FILTERS */}
      {showAdvanced && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm border transition ${
                  filters.amenities.includes(a)
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-700 hover:border-black"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
