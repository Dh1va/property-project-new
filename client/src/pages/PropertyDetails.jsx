// src/pages/PropertyDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EnquiryFormPanel from "../components/EnquiryFormPanel";
import API from "../services/api";
import PropertyGallery from "../components/PropertyGallery";


import Slider from "react-slick"; // for related properties on mobile

import Bank1 from "../assets/images/Bank logo-01.png";
import Bank2 from "../assets/images/Bank logo-02.png";
import Bank3 from "../assets/images/Bank logo-03.png";
import Bank4 from "../assets/images/Bank logo-04.png";
import Bank5 from "../assets/images/Bank logo-05.png";
import Bank6 from "../assets/images/Bank logo-06.png";
import {
  MapPin,
  Bath,
  Bed,
  Expand,
  Landmark,
  Link as LinkIcon,
  TreePine,
  Waves,
  Building2,
  Bus,
  TrainFront,
  ArrowUpFromDot,
  ParkingCircle,
} from "lucide-react";

import Breadcrumb from "../components/BreadCrumb";
import PageContainer from "../components/PageContainer";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const computeDisplayId = (p) => {
    if (!p) return "";
    if (p.refNumber) return p.refNumber;
    if (p.id) return `PROP-${String(p.id).padStart(3, "0")}`;
    if (p._id) return `PROP-${p._id.slice(-6).toUpperCase()}`;
    return "";
  };

  const FIXED_AGENT_PHONE = "+91 95003 06566";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(`/properties/${id}`);
        const prop = res.data;
        setProperty(prop);
        setMainImage(prop.images?.[0] || "");

        try {
          const allRes = await API.get("/properties");
          const all = allRes.data || [];
          const relatedProps = all
            .filter((p) => (p._id || p.id) !== (prop._id || prop.id))
            .filter(
              (p) =>
                p.type === prop.type ||
                (p.city && prop.city && p.city === prop.city)
            )
            .slice(0, 4);
          setRelated(relatedProps);
        } catch (relErr) {
          console.error("Fetch related properties error:", relErr);
        }
      } catch (err) {
        console.error("Fetch property error:", err);
        setError(err?.response?.data?.message || "Property not found");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-20">Loading property…</p>;
  }

  if (error || !property) {
    return (
      <p className="text-center mt-20 text-gray-500">
        {error || "Property not found."}
      </p>
    );
  }

  const propertyIdDisplay = computeDisplayId(property);
  const price = property.totalPrice ?? property.price ?? 0;
  const size = property.squareMeters ?? property.size ?? 0;
  const rooms = property.rooms ?? property.bedrooms ?? 0;
  const baths = property.bathrooms ?? 0;

  const images = property.images?.length ? property.images : [];
  const activeMainImage = mainImage || images[0] || "";

  const thumbImages = images.filter((img) => img !== activeMainImage);
  const maxDesktopThumbs = 3;
  const desktopThumbs = thumbImages.slice(0, maxDesktopThumbs);
  const extraDesktopCount = thumbImages.length - desktopThumbs.length;

  const baseFeatureChips = [
    rooms && {
      id: "beds",
      icon: <Bed className="w-4 h-4" />,
      label: `${rooms} Beds`,
    },
    baths && {
      id: "baths",
      icon: <Bath className="w-4 h-4" />,
      label: `${baths} Baths`,
    },
    size && {
      id: "area",
      icon: <Expand className="w-4 h-4" />,
      label: `${size} m²`,
    },
  ].filter(Boolean);

  const rawAmenities = property.amenities || [];

  const amenityChips = rawAmenities.map((a, idx) => {
    let label = "";

    if (typeof a === "string") {
      label = a;
    } else if (a && typeof a === "object") {
      label = a.label || a.name || a.title || JSON.stringify(a);
    }

    const key = label.toLowerCase().trim();
    let icon;

    if (key.includes("garden")) {
      icon = <TreePine className="w-4 h-4" />;
    } else if (key.includes("pool")) {
      icon = <Waves className="w-4 h-4" />;
    } else if (key.includes("balcony") || key.includes("terrace")) {
      icon = <Building2 className="w-4 h-4" />;
    } else if (key.includes("transit") || key.includes("bus")) {
      icon = <Bus className="w-4 h-4" />;
    } else if (key.includes("train")) {
      icon = <TrainFront className="w-4 h-4" />;
    } else if (key.includes("elevator") || key.includes("lift")) {
      icon = <ArrowUpFromDot className="w-4 h-4" />;
    } else if (key.includes("parking") || key.includes("garage")) {
      icon = <ParkingCircle className="w-4 h-4" />;
    } else {
      icon = (
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block" />
      );
    }

    return {
      id: `amenity-${idx}`,
      icon,
      label,
    };
  });

  const keyFeatureChips = [...baseFeatureChips, ...amenityChips];

  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    if (navigator.clipboard && currentUrl) {
      navigator.clipboard
        .writeText(currentUrl)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => console.error("Copy failed", err));
    } else {
      alert("Copy not supported in this browser.");
    }
  };

  const handleWhatsAppShare = () => {
    if (!currentUrl) return;
    const msg = `Check this property: ${property.title}\n${currentUrl}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleSystemShare = () => {
    if (navigator.share && currentUrl) {
      navigator
        .share({
          title: property.title,
          text: "Check out this property",
          url: currentUrl,
        })
        .catch((err) => console.error("Share failed", err));
    } else {
      handleCopyLink();
    }
  };

  const agentPhone = FIXED_AGENT_PHONE;

  const buildMobileWhatsAppMessage = () => {
    const title = property.title || "the property";
    const ref = propertyIdDisplay ? ` (Ref: ${propertyIdDisplay})` : "";
    return `Hi, I'm interested in ${title}${ref}.\n${currentUrl}`;
  };

  const handleMobileWhatsApp = () => {
    const text = buildMobileWhatsAppMessage();
    let url;
    if (agentPhone) {
      const raw = agentPhone.replace(/[^\d]/g, "");
      url = `https://wa.me/${raw}?text=${encodeURIComponent(text)}`;
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleMobileCall = () => {
    if (!agentPhone) return;
    window.location.href = `tel:${agentPhone}`;
  };

  return (
    <div className="relative">
      {/* enough bottom padding for fixed mobile bar */}
      <PageContainer className="pt-28 pb-28 md:pt-32 md:pb-20">
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            {
              label: property.type,
              path: `/properties/${property.type
                ?.toLowerCase()
                .replace(/\s+/g, "-")}`,
            },
            { label: property.title },
          ]}
        />

        {/* GALLERY – Project style slider */}
<PropertyGallery images={images} />

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
          {/* LEFT – details card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 self-start flex flex-col justify-between h-full">
            {/* MOBILE HEADER */}
            <div className="flex flex-col gap-2 mb-2 md:hidden">
              {/* Row 1: share icons right */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition"
                  aria-label="Share on WhatsApp"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    className="text-green-600"
                    fill="currentColor"
                  >
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition"
                  aria-label="Copy link"
                >
                  <LinkIcon className="w-4 h-4 text-gray-700" />
                </button>

                <button
                  type="button"
                  onClick={handleSystemShare}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition"
                  aria-label="Share"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                    />
                  </svg>
                </button>
              </div>

              {/* Row 2: title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {property.title}
              </h1>

              {/* Row 3: location */}
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2 text-gray-800" />
                <span className="text-sm">
                  {property.city} - {property.zip}, {property.country}
                </span>
              </div>
            </div>

            {/* DESKTOP HEADER */}
            <div className="hidden md:flex justify-between gap-4 mb-2">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-600 mt-0.5">
                  <MapPin className="w-5 h-5 mr-2 text-gray-800" />
                  <span className="text-base">
                    {property.city} - {property.zip}, {property.country}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition"
                  aria-label="Share on WhatsApp"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    className="text-green-600"
                    fill="currentColor"
                  >
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition"
                  aria-label="Copy link"
                >
                  <LinkIcon className="w-4 h-4 text-gray-700" />
                </button>

                <button
                  type="button"
                  onClick={handleSystemShare}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition"
                  aria-label="Share"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* VERIFIED + PRICE */}
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#c8e6c9"
                    d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"
                  ></path>
                  <path
                    fill="#4caf50"
                    d="M34.586,14.586l-13.57,13.586l-5.602-5.586l-2.828,2.828l8.434,8.414l16.395-16.414L34.586,14.586z"
                  ></path>
                </svg>
                Verified Listing
              </span>

              <span className="text-lg md:text-2xl font-semibold text-gray-900">
                ₹ {Number(price).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Description */}
            <div className="border-t border-gray-100 pt-6 mb-8">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* KEY FEATURES */}
            <div className="mt-2">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                Key Features
              </h2>

              <div className="p-0 md:p-1">
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {keyFeatureChips.map((item) => (
                    <div
                      key={item.id}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs md:text-sm text-gray-700"
                    >
                      <span className="text-gray-500 flex items-center justify-center">
                        {item.icon}
                      </span>
                      <span className="whitespace-nowrap">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AREAS & LOT */}
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                Areas &amp; Lot
              </h2>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
                <div className="flex items-center justify-between px-4 py-3 text-xs md:text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-gray-900">
                    {property.status || "For Sale"}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3 text-xs md:text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900 text-right">
                    {property.address ||
                      [property.city, property.country]
                        .filter(Boolean)
                        .join(", ")}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3 text-xs md:text-sm">
                  <span className="text-gray-500">Living Space</span>
                  <span className="font-medium text-gray-900">
                    {size ? `${size} m²` : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3 text-xs md:text-sm">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium text-gray-900">
                    {property.type || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3 text-xs md:text-sm">
                  <span className="text-gray-500">Reference ID</span>
                  <span className="font-medium text-gray-900">
                    {propertyIdDisplay || "–"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank info block */}
            <div className="mt-6 bg-[#EDEAE3] rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Landmark className="w-7 h-7 text-black hidden md:block" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    All Major Banks Loan Available
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Get easy financing options through top banks.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 mt-4">
                {[Bank1, Bank2, Bank3, Bank4, Bank5, Bank6].map((bank, i) => (
                  <img
                    key={i}
                    src={bank}
                    alt={`Bank ${i + 1}`}
                    className="h-12 w-auto object-contain opacity-90 hover:opacity-100 transition duration-200"
                  />
                ))}
                <span className="text-gray-700 text-sm font-medium italic">
                  and many more leading banks...
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT – Enquiry + Nearby */}
          <div className="space-y-6 flex flex-col justify-between h-full">
            <div>
              <EnquiryFormPanel
                propertyTitle={property.title}
                propertyRef={propertyIdDisplay}
                agentPhone={agentPhone}
              />
            </div>

            {/* PROPERTIES NEARBY */}
            {(() => {
              const fallbackImg =
                "/mnt/data/bc98def2-2ad1-4314-8d62-eb32ff8eda97.jfif";

              const mobileSliderSettings = {
                dots: true,
                arrows: false,
                infinite: related.length > 1,
                speed: 400,
                slidesToShow: 1,
                slidesToScroll: 1,
                adaptiveHeight: true,
              };

              return (
                <div className="p-4 pb-6 md:pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Properties Nearby
                  </h3>

                  {/* MOBILE: vertical cards */}
                  <div className="md:hidden">
                    {related.length ? (
                      <Slider {...mobileSliderSettings}>
                        {related.map((p) => {
                          const relId = p._id || p.id;
                          const relPrice = p.totalPrice ?? p.price ?? 0;
                          const imgSrc =
                            (p.images && p.images.length && p.images[0]) ||
                            fallbackImg;

                          return (
                            <div key={relId} className="px-1">
                              <article
                                onClick={() =>
                                  navigate(`/property/${relId}`)
                                }
                                className="rounded-xl border border-gray-200 bg-white cursor-pointer shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1 overflow-hidden flex flex-col"
                              >
                                {/* image on top */}
                                <img
                                  src={imgSrc}
                                  alt={p.title}
                                  className="w-full h-32 object-cover"
                                />

                                {/* content */}
                                <div className="p-3 flex flex-col gap-1">
                                  {/* title + price */}
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                      {p.title}
                                    </h4>
                                    <span className="text-sm font-semibold text-right">
                                      ₹{" "}
                                      {Number(relPrice).toLocaleString(
                                        "en-IN"
                                      )}
                                    </span>
                                  </div>

                                  {/* location */}
                                  <p className="text-xs text-gray-600 truncate">
                                    {p.city}
                                    {p.country ? `, ${p.country}` : ""}
                                  </p>

                                  {/* stats */}
                                  <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Bed className="w-4 h-4" />{" "}
                                      {p.rooms ?? "-"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Bath className="w-4 h-4" />{" "}
                                      {p.bathrooms ?? "-"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Expand className="w-4 h-4" />{" "}
                                      {p.squareMeters ?? p.size ?? "-"} m²
                                    </span>
                                  </div>

                                  {/* button full width */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/property/${relId}`);
                                    }}
                                    className="mt-3 w-full py-1.5 rounded-full bg-black text-white text-xs font-medium hover:bg-gray-800 transition"
                                  >
                                    View
                                  </button>
                                </div>
                              </article>
                            </div>
                          );
                        })}
                      </Slider>
                    ) : (
                      <p className="text-sm text-gray-500 text-center">
                        No nearby properties available.
                      </p>
                    )}
                  </div>

                  {/* DESKTOP LIST */}
                  <div className="hidden md:block">
                    {related.length ? (
                      <div className="space-y-3">
                        {related.map((p) => {
                          const relId = p._id || p.id;
                          const relPrice = p.totalPrice ?? p.price ?? 0;
                          const imgSrc =
                            (p.images && p.images.length && p.images[0]) ||
                            fallbackImg;

                          return (
                            <article
                              onClick={() =>
                                navigate(`/property/${relId}`)
                              }
                              key={relId}
                              className="flex items-stretch gap-3 p-3 rounded-lg border border-gray-100 cursor-pointer hover:shadow-lg transition-transform transform hover:-translate-y-1 bg-white"
                            >
                              <img
                                src={imgSrc}
                                alt={p.title}
                                className="w-24 h-20 object-cover rounded-md flex-shrink-0"
                              />

                              <div className="flex-1 min-w-0 flex flex-col">
                                <div className="flex items-start justify-between">
                                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 truncate">
                                    {p.title}
                                  </h4>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-gray-600 mt-1 truncate">
                                    {p.city}
                                    {p.country ? `, ${p.country}` : ""}
                                  </p>
                                  <span className="text-sm font-semibold">
                                    ₹{" "}
                                    {Number(relPrice).toLocaleString(
                                      "en-IN"
                                    )}
                                  </span>
                                </div>

                                <div className="flex-1" />

                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Bed className="w-4 h-4" />{" "}
                                      {p.rooms ?? "-"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Bath className="w-4 h-4" />{" "}
                                      {p.bathrooms ?? "-"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Expand className="w-4 h-4" />{" "}
                                      {p.squareMeters ??
                                        p.size ??
                                        "-"}{" "}
                                      m²
                                    </span>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/property/${relId}`);
                                    }}
                                    className="px-3 py-1 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition cursor-pointer"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center">
                        No nearby properties available.
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </PageContainer>

      {/* Mobile Bottom Action Bar */}
      <div className="md:hidden">
        <div className="fixed inset-x-0 bottom-4 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-md shadow-xl rounded-full border border-gray-200 px-3 py-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleMobileWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-green-600 text-white text-sm font-semibold hover:brightness-95 active:scale-95 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
              >
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
              </svg>
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleMobileCall}
              disabled={!agentPhone}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition active:scale-95 ${
                agentPhone
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                />
              </svg>
              <span>{agentPhone ? "Call" : "No Phone"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
