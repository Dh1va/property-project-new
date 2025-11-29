// src/components/PropertyCard.jsx
import React, { useRef, useState } from "react";
import Slider from "react-slick";
import { MapPin, Expand, Bed } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
};

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

  // Start slider autoplay on hover
  const handleMouseEnter = () => {
    sliderRef.current?.slickPlay?.();
  };

  // Stop autoplay when mouse leaves
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
    autoplay: false, // disabled by default; hover triggers play
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
      className="bg-white rounded-[1.25rem] shadow-md border border-gray-100 w-full h-full flex flex-col overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
      onClick={goToDetails}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* IMAGE HEAD — responsive heights */}
      <div className="relative px-3 pt-3">
        <div className="rounded-[1rem] overflow-hidden w-full h-44 md:h-56 lg:h-60">
          {images.length > 0 ? (
            <Slider ref={sliderRef} {...sliderSettings}>
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={property.title || `property-${index}`}
                  className="w-full h-44 md:h-56 lg:h-60 object-cover"
                />
              ))}
            </Slider>
          ) : (
            <div className="w-full h-44 md:h-56 lg:h-60 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
              No image available
            </div>
          )}
        </div>

        {/* Type badge */}
        {property.type && (
          <div className="absolute top-6 right-6 z-20 px-3 py-1 rounded-full bg-white text-black text-xs font-medium shadow-sm">
            {property.type}
          </div>
        )}

        {/* Slider dots */}
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-2 z-20 flex justify-center">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow">
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
                    activeIndex === index ? "w-2.5 h-2.5 bg-gray-800" : "w-1.5 h-1.5 bg-gray-400/60"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BODY (flex-grow) */}
      <div className="px-5 pt-4 pb-5 text-gray-900 flex-1 flex flex-col">
        {/* Title */}
        {property.title && (
          <h3 className="my-1 text-sm md:text-base lg:text-lg font-semibold text-gray-800 truncate">
            {property.title}
          </h3>
        )}

        {/* Location + Price */}
        <div className="flex items-start justify-between gap-3 mt-1">
          {address ? (
            <p className="flex-1 flex items-center gap-2 text-xs sm:text-sm text-gray-700 min-w-0">
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="truncate">{address}</span>
            </p>
          ) : (
            <div className="flex-1" />
          )}

          <p className="text-sm sm:text-base md:text-lg font-semibold whitespace-nowrap">
            ₹ {formatPriceINR(price)}
          </p>
        </div>

        <div className="mt-3 border-t border-gray-100" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mt-3">
          <div className="flex items-center gap-2 min-w-0">
            <Expand className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="font-medium truncate">{size} m²</span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <Bed className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {rooms} Rooms{baths ? ` · ${baths} Baths` : ""}
            </span>
          </div>
        </div>

        {/* meta + button pinned at bottom */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-green-600 text-[10px]">✔</span>
            Verified Listing
          </span>
          <span>{timeAgo}</span>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToDetails();
            }}
            className="w-full py-3 rounded-full bg-gradient-to-b from-gray-900 to-black text-white text-sm font-medium shadow-sm hover:brightness-110 transition cursor-pointer"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
