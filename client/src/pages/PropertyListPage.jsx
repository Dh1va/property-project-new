import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import API from "../services/api";
import Breadcrumb from "../components/BreadCrumb";
import CategoryFilterForm from "../components/CategoryFilterForm";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "../components/PageContainer";

const fetchAllProperties = async () => {
  const res = await API.get("/properties");
  return res.data || [];
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const PropertyListPage = () => {
  const { category } = useParams();
  const listRef = useRef(null);

  const { data: allProperties = [], isLoading, isError, error, isFetching } =
    useQuery({
      queryKey: ["properties"],
      queryFn: fetchAllProperties,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });

  const normalized = (category || "").toLowerCase().replace(/\s+/g, "-");
  const formattedTitle = (category || "").replace(/-/g, " ");
  const pluralTitle =
    formattedTitle && formattedTitle.length
      ? formattedTitle.endsWith("s")
        ? formattedTitle
        : formattedTitle + "s"
      : "Properties";

  const baseProperties = useMemo(() => {
    if (!normalized) return [];
    return (allProperties || []).filter((p) => {
      const citySlug = (p.city || "").toLowerCase().replace(/\s+/g, "-");
      const typeSlug = (p.type || "").toLowerCase().replace(/\s+/g, "-");
      return citySlug === normalized || typeSlug === normalized;
    });
  }, [allProperties, normalized]);

  const [filteredProperties, setFilteredProperties] = useState([]);
  useEffect(() => {
    setFilteredProperties(baseProperties);
    setCurrentPage(1);
  }, [baseProperties]);

  const propertiesPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProperties]);

  const totalMatching = filteredProperties.length;
  const totalCategory = baseProperties.length;
  const totalAll = allProperties.length;
  const totalPages = Math.max(1, Math.ceil(totalMatching / propertiesPerPage));

  const startIndex = (currentPage - 1) * propertiesPerPage;
  const currentProperties = filteredProperties.slice(
    startIndex,
    startIndex + propertiesPerPage
  );

  const startItem = totalMatching ? startIndex + 1 : 0;
  const endItem = Math.min(startIndex + propertiesPerPage, totalMatching);

  const handlePageChange = (pageNumber) => {
    const next = clamp(pageNumber, 1, totalPages);
    setCurrentPage(next);
    setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

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

  const handleFilter = (filters) => {
    const maxPrice = Number(filters.maxPrice);
    const hasPriceFilter = !Number.isNaN(maxPrice) && maxPrice > 0;

    if (
      !filters.city &&
      !filters.rooms &&
      (!filters.amenities || filters.amenities.length === 0) &&
      !hasPriceFilter
    ) {
      setFilteredProperties(baseProperties);
      setCurrentPage(1);
      return;
    }

    const next = baseProperties.filter((property) => {
      const propertyPrice =
        Number(property.totalPrice ?? property.price ?? 0) || 0;

      const searchCity = (filters.city || "").toLowerCase();
      const locationString = (
        (property.city || "") +
        " " +
        (property.place || "") +
        " " +
        (property.postalCode ||
          property.zipCode ||
          property.zip ||
          property.pincode ||
          "")
      )
        .toString()
        .toLowerCase();
      const matchesCity = !searchCity || locationString.includes(searchCity);

      const matchesRooms =
        !filters.rooms || (property.rooms ?? 0) >= Number(filters.rooms);

      const matchesAmenities =
        !filters.amenities?.length ||
        filters.amenities.every((a) => (property.amenities || []).includes(a));

      const matchesPrice = !hasPriceFilter || propertyPrice <= maxPrice;

      return matchesCity && matchesRooms && matchesAmenities && matchesPrice;
    });

    setFilteredProperties(next);
    setCurrentPage(1);
  };

  const loading = isLoading;
  const errorMsg = isError
    ? error?.response?.data?.message || String(error) || "Failed to load properties"
    : "";

  return (
    <PageContainer>
      <div className="py-28" ref={listRef}>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: pluralTitle },
          ]}
        />

        <div className="mb-6">
          <CategoryFilterForm onFilter={handleFilter} />
        </div>

        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-1 capitalize">{pluralTitle}</h1>

          {!loading && !isError && (
            <div className="text-base font-medium text-gray-700">
              Showing {startItem}-{endItem} of {totalMatching} matching properties
              {totalCategory > totalMatching &&
                ` (from ${totalCategory} total in category)`}
              {isFetching ? " · updating..." : ""}
            </div>
          )}
        </div>

        {loading ? (
          <p>Loading properties…</p>
        ) : isError ? (
          <p className="text-red-600">{errorMsg}</p>
        ) : (
          <>
            {totalMatching === 0 ? (
              <div className="mt-12 text-center space-y-3">
                <p className="font-semibold text-xl text-gray-800">
                  No properties match your search.
                </p>
                {totalCategory > 0 && (
                  <p className="text-sm text-gray-600">
                    We currently have {totalCategory} properties in this category. Try adjusting your filters.
                  </p>
                )}
                {totalCategory === 0 && totalAll > 0 && (
                  <p className="text-sm text-gray-600">
                    No properties found in this category. There are {totalAll} properties overall.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-8 mb-16 items-stretch">
                  {currentProperties.map((property) => (
                    <PropertyCard key={property._id || property.id} property={property} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center flex-wrap gap-3 mb-6">
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
              </>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default PropertyListPage;
