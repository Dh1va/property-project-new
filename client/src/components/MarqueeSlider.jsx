// src/components/MarqueeSlider.jsx
import React from "react";
import {
  Search,
  Home,
  Mail,
  MapPin,
  Star,
  Filter,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

const MarqueeSlider = () => {
 const cardsData = [
  {
    icon: Search,
    title: "Advanced Property Search",
    description: "Find properties easily using filters like budget, type, and location.",
  },
  {
    icon: Home,
    title: "High-Quality Listings",
    description: "Detailed photos, descriptions, amenities, and property highlights.",
  },
  {
    icon: Mail,
    title: "Direct Enquiry System",
    description: "Contact property owners instantly through a simple enquiry form.",
  },
  {
    icon: MapPin,
    title: "Location Map Integration",
    description: "View properties with map-based location insights.",
  },
  {
    icon: Star,
    title: "Featured Properties",
    description: "Showcase top, trending, or newly added properties.",
  },
  {
    icon: Filter,
    title: "Smart Filters & Sorting",
    description: "Sort by price, newest listings, or property categories.",
  },
  {
    icon: Smartphone,
    title: "Fully Responsive Design",
    description: "Optimized experience on mobile, tablet, and desktop.",
  },
  {
    icon: ShieldCheck,
    title: "Admin Control Panel",
    description: "Admins can manage listings and enquiries with ease.",
  },
];

const CreateCard = ({ card }) => {
  const Icon = card.icon;

  return (
    <div
      className="
        p-4 rounded-xl mx-2 md:mx-3 
        w-52 sm:w-56 md:w-60 lg:w-64 shrink-0
        bg-gradient-to-br from-white via-gray-50 to-gray-100
        border border-gray-200
        shadow-sm 
        transition-all duration-300 
        hover:shadow-xl hover:-translate-y-1 
        hover:from-gray-50 hover:via-gray-100 hover:to-gray-200
      "
    >
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-gradient-to-br from-[#F5F3EE] to-[#D7D3CB] shadow-sm">
  <Icon className="w-6 h-6 text-gray-800" />
</div>

        <p className="text-base font-semibold text-gray-900">
          {card.title}
        </p>
      </div>

      <p className="text-sm mt-3 text-gray-700 leading-relaxed">
        {card.description}
      </p>
    </div>
  );
};



  return (
    <>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-inner {
          animation: marqueeScroll 20s linear infinite;
          will-change: transform;
        }
        .marquee-reverse {
          animation-direction: reverse;
        }
      `}</style>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight text-center mt-15 mb-10">
            Designed for a Seamless Property Experience
          </h2>

      {/* main row - full width with small padding so it hugs viewport */}
      <div className="marquee-row w-full mx-auto max-w-full px-3 md:px-6 overflow-hidden relative">
        {/* left gradient mask (narrower than before so less visual cut) */}
        <div className="absolute left-0 top-0 h-full w-6 md:w-12 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
        {/* marquee inner - using min-w smaller than 200% so loop shows earlier */}
        <div className="marquee-inner flex transform-gpu min-w-[150%] py-6">
          {[...cardsData, ...cardsData].map((card, index) => (
            <CreateCard key={index} card={card} />
          ))}
        </div>
        <div className="absolute right-0 top-0 h-full w-6 md:w-12 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
      </div>

      {/* second row reversed for visual effect */}
      <div className="marquee-row w-full mx-auto max-w-full px-3 md:px-6 overflow-hidden relative mt-2">
        <div className="absolute left-0 top-0 h-full w-6 md:w-12 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
        <div className="marquee-inner marquee-reverse flex transform-gpu min-w-[150%] py-6">
          {[...cardsData, ...cardsData].map((card, index) => (
            <CreateCard key={`r-${index}`} card={card} />
          ))}
        </div>
        <div className="absolute right-0 top-0 h-full w-6 md:w-12 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
      </div>
    </>
  );
};

export default MarqueeSlider;
