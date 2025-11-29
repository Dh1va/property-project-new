import React from "react";
import { useNavigate } from "react-router-dom";

import farmland from "../assets/images/farmland-min.jpg";
import apartment from "../assets/images/apartment-min.jpg";
import commercialbuilding from "../assets/images/commercialbuilding-min.jpg";
import commercialland from "../assets/images/commercialland-min.jpg";
import houseplot from "../assets/images/houseplot-min.jpg";
import land from "../assets/images/land-min.jpg";
import office from "../assets/images/office-min.jpg";
import residential from "../assets/images/residential-min.jpg";
import retail from "../assets/images/retail-min.jpg";
import villa from "../assets/images/villa-min.jpg";

// IMPORTANT:
// slug must match how your PropertyListPage normalizes category:
//   category.toLowerCase().replace(/\s+/g, "-")

const CATEGORY_ITEMS = [
  { label: "Agriland", slug: "agriland", image: farmland },
  { label: "Apartment", slug: "apartment", image: apartment },
  {
    label: "Commercial Building",
    slug: "commercial-building", // backend: "Commercial Building"
    image: commercialbuilding,
  },
  { label: "Commercial Land", slug: "commercial-land", image: commercialland },
  { label: "Houseplot", slug: "houseplot", image: houseplot },
  { label: "Land", slug: "land", image: land },
  { label: "Office", slug: "office", image: office },
  { label: "Residential", slug: "residential", image: residential },
  { label: "Retail", slug: "retail", image: retail },
  { label: "Villa", slug: "villa", image: villa },
];

const CategoryGrid = ({ countsBySlug = {}, loading = false }) => {
  const navigate = useNavigate();

  const handleClick = (slug) => {
    navigate(`/properties/${slug}`);
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Browse by Category
        </h2>
        <p className="text-gray-600 mb-6">
          Quickly explore properties by type – residential, commercial, land and more.
        </p>

        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
          {CATEGORY_ITEMS.map((item) => {
            const count = countsBySlug[item.slug] || 0;

            return (
              <button
                key={item.slug}
                onClick={() => handleClick(item.slug)}
                className="relative group rounded-2xl overflow-hidden h-32 sm:h-40 text-left cursor-pointer
                           transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none"
              >
                {/* Background image with hover zoom */}
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url(${item.image})` }}
                />

                {/* Dark overlay with subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

                {/* Text content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-3 sm:p-4">
                  <h3 className="text-white text-sm sm:text-base font-semibold drop-shadow line-clamp-1">
                    {item.label}
                  </h3>
                  <p className="text-gray-200 text-[11px] sm:text-xs mt-0.5">
                    {loading
                      ? "Loading…"
                      : count > 0
                      ? `${count} properties`
                      : "Explore properties"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
