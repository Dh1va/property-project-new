import React, { useState, useRef, useEffect } from "react";
import PropertyCard from "./PropertyCard";

const PropertyList = ({ properties, totalCount: totalFromParent }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 8; // 🔹 4 per row × 2 rows
  const listRef = useRef(null);

  const totalCount =
    typeof totalFromParent === "number" ? totalFromParent : properties.length;

  const totalPages =
    Math.ceil(properties.length / propertiesPerPage) || 1;
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const currentProperties = properties.slice(
    startIndex,
    startIndex + propertiesPerPage
  );

  const startItem = properties.length ? startIndex + 1 : 0;
  const endItem = Math.min(startIndex + propertiesPerPage, properties.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [properties]);

  if (!properties.length)
    return (
      <div className="mt-12 text-center space-y-3">
        <p className="font-semibold text-xl text-gray-800">
          No properties match your search.
        </p>
        {totalCount > 0 && (
          <p className="text-sm text-gray-600">
            We currently have {totalCount} properties available. Try adjusting your filters.
          </p>
        )}
      </div>
    );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setTimeout(() => {
      listRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // Pagination numbers with dots
  const visiblePages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      visiblePages.push(i);
    } else if (
      (i === currentPage - 2 && currentPage > 3) ||
      (i === currentPage + 2 && currentPage < totalPages - 2)
    ) {
      visiblePages.push("...");
    }
  }

  return (
    <div ref={listRef} className="mt-12">

      {/* 🔢 Result Summary */}
      <div className="mb-8 text-start text-base font-medium text-gray-700">
        Showing {startItem}-{endItem} of {properties.length} matching properties
        {totalCount > properties.length &&
          ` (from ${totalCount} total properties)`}
      </div>

      {/* 🏘️ Property Grid — 1 / 2 / 3 / 4 columns (mobile -> desktop) */}

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8 px-4 sm:px-0 mb-16 items-stretch">
  {currentProperties.map((property) => (
    <PropertyCard key={property._id || property.id} property={property} />
  ))}
</div>



      {/* 📄 Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center flex-wrap gap-3 mb-6">

          {/* Prev */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md border text-sm font-medium ${
              currentPage === 1
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-black border-black hover:bg-black hover:text-white transition"
            }`}
          >
            Prev
          </button>

          {/* Page Numbers */}
          {visiblePages.map((page, index) =>
            page === "..." ? (
              <span
                key={index}
                className="px-3 py-2 text-gray-400 select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-md border text-sm font-medium transition ${
                  currentPage === page
                    ? "bg-black text-white border-black"
                    : "text-gray-700 border-gray-300 hover:border-black"
                }`}
              >
                {page}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md border text-sm font-medium ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-black border-black hover:bg-black hover:text-white transition"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyList;
