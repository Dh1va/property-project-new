// src/components/PropertyCard.jsx
import React, { useRef, useState } from "react";
import Slider from "react-slick";
import { MapPin, Expand, Bed, Bath, Clock, Check } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

// Helper function to calculate time ago (Keep the same logic)
const getTimeAgo = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (isNaN(date)) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} week${diffDays > 1 ? "s" : ""} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
};

// Helper function to format price in INR (Keep the same logic)
const formatPriceINR = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(num);
};

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleMouseEnter = () => {
    sliderRef.current?.slickPlay?.();
  };

  const handleMouseLeave = () => {
    sliderRef.current?.slickPause?.();
  };

  const id = property._id || property.id;
  const price = property.totalPrice ?? property.price ?? 0;
  const size = property.squareMeters ?? property.size ?? 0;
  const rooms = property.rooms ?? property.bedrooms ?? 0;
  const baths = property.bathrooms ?? 0;
  const images = property.images?.length ? property.images : [];

  const sliderSettings = {
    dots: false,
    arrows: false,
    infinite: images.length > 1,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2200,
    pauseOnHover: true,
    beforeChange: (_, next) => setActiveIndex(next),
  };

  const goToDetails = () => window.open(`/property/${id}`, "_blank");

  const address =
    property.address ||
    [property.city, property.country].filter(Boolean).join(", ");

  const createdDate =
    property.createdAt || property.listedAt || property.created_at;
  const timeAgo = getTimeAgo(createdDate) || "Recently";

  return (
    <div
      className="bg-white rounded-xl shadow-lg border border-gray-100 w-full h-full flex flex-col overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      onClick={goToDetails}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* IMAGE HEAD */}
      <div className="relative p-3">
        <div className="rounded-lg overflow-hidden w-full h-48 md:h-56 lg:h-64 aspect-video">
          {images.length > 0 ? (
            <Slider ref={sliderRef} {...sliderSettings}>
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={property.title || `property-${index}`}
                  className="w-full h-48 md:h-56 lg:h-64 object-cover" 
                />
              ))}
            </Slider>
          ) : (
            <div className="w-full h-48 md:h-56 lg:h-64 bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-medium">
              No image available
            </div>
          )}
        </div>

        {/* Type badge - Minimalist black text on white */}
        {property.type && (
          <div className="absolute top-6 right-6 z-20 px-3 py-1 rounded-full bg-white text-gray-800 text-xs font-bold shadow-md uppercase tracking-widest border border-gray-200">
            {property.type}
          </div>
        )}

        {/* Slider dots - White/Gray for max contrast */}
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center">
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-gray-900/50 backdrop-blur-sm shadow-inner">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sliderRef.current?.slickGoTo(index);
                    setActiveIndex(index);
                  }}
                  className={`rounded-full transition-all ${
                    activeIndex === index 
                      ? "w-3 h-1.5 bg-white" 
                      : "w-1.5 h-1.5 bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BODY (flex-grow) - Reduced vertical padding (pt-3 -> pt-2, pb-5 -> pb-4) */}
      <div className="px-5 pt-2 pb-4 text-gray-900 flex-1 flex flex-col">
        
        {/* Title and Price - COMBINED ROW to reduce empty space on the right */}
        <div className="flex justify-between items-start mb-1">
            {/* Title */}
            {property.title && (
              <h3 className="text-base md:text-lg font-semibold text-gray-800 line-clamp-2 leading-tight pr-3 max-w-[70%]">
                {property.title}
              </h3>
            )}
            
            {/* Price - Bold Black, condensed font size */}
            <p className="text-lg font-extrabold text-black whitespace-nowrap">
              ₹ {formatPriceINR(price)}
            </p>
        </div>


        {/* Location - Subtler Gray text and icon */}
        {address && (
          <p className="flex items-center gap-1 text-sm text-gray-600 mt-1 min-w-0">
            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="truncate">{address}</span>
          </p>
        )}

        {/* Separator - Reduced vertical margin (my-4 -> my-3) */}
        <div className="my-3 border-t border-gray-200" />

        {/* Stats - Tighter layout, distributed evenly */}
        <div className="flex items-center justify-between text-sm text-gray-700">
          
          {/* Size */}
          <div className="flex items-center gap-1.5">
            <Expand className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="font-medium">{size} m²</span>
          </div>

          {/* Rooms */}
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="font-medium">{rooms} Beds</span>
          </div>
          
          {/* Baths */}
          {baths > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="font-medium">{baths} Baths</span>
            </div>
          )}
        </div>
        
        {/* meta + button pinned at bottom */}
        <div className="mt-4 flex flex-col gap-3">
          
          {/* Meta data - Verification (Green) and Time Ago */}
          <div className="flex items-center justify-between text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-300">
              <Check className="w-3 h-3 text-green-700"/> Verified Listing
            </span>
            
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400"/>
              {timeAgo}
            </span>
          </div>

          {/* Button - Solid Black */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToDetails();
            }}
            className="w-full py-3 rounded-lg bg-black text-white text-sm font-semibold shadow-md shadow-gray-400 hover:bg-gray-800 transition duration-150 active:scale-[0.99] border border-black"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;