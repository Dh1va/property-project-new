import React, { useState, useRef, useEffect } from "react";
import FilterForm from "../components/FilterForm";
import PropertyList from "../components/PropertyList";
import InfoSection from "../components/InfoSection";
import Enquiry from "../components/Enquiry";
import API from "../services/api";
import CategoryGrid from "../components/CategoryGrid";
import PageContainer from "../components/PageContainer";
import RadialServiceSlider from "../components/RadialServiceSlider";
import BlogList from "../components/BlogList";
import TestimonialsSlider from "../components/TestimonialsSlider";
import FAQ from "../components/FAQ";


const Buy = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryCounts, setCategoryCounts] = useState({});
  const propertyListRef = useRef(null);

  const slugifyType = (type = "") =>
    type.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    const fetchProps = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/properties");
        const data = res.data || [];
        setAllProperties(data);
        setFilteredProperties(data);

        const map = {};
        data.forEach((p) => {
          if (!p.type) return;
          const slug = slugifyType(p.type);
          if (!slug) return;
          map[slug] = (map[slug] || 0) + 1;
        });
        setCategoryCounts(map);
      } catch (err) {
        console.error("Fetch properties error:", err);
        setError(err?.response?.data?.message || "Failed to load properties");
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, []);

  const handleFilter = (filters) => {
    if (
      !filters.city &&
      !filters.type &&
      !filters.minBudget &&
      !filters.maxBudget &&
      !filters.minSqm &&
      !filters.maxSqm &&
      !filters.minRooms &&
      !filters.maxRooms &&
      !filters.newItem &&
      (!filters.amenities || filters.amenities.length === 0)
    ) {
      setFilteredProperties(allProperties);
      return;
    }

    const filtered = allProperties.filter((property) => {
      const price = property.totalPrice ?? property.price ?? 0;
      const size = property.squareMeters ?? property.size ?? 0;

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

      const matchesType =
        !filters.type ||
        (property.type || "").toLowerCase() ===
          filters.type.toLowerCase();
      const matchesMinPrice =
        !filters.minBudget || price >= Number(filters.minBudget);
      const matchesMaxPrice =
        !filters.maxBudget || price <= Number(filters.maxBudget);
      const matchesMinSqm =
        !filters.minSqm || size >= Number(filters.minSqm);
      const matchesMaxSqm =
        !filters.maxSqm || size <= Number(filters.maxSqm);
      const matchesMinRooms =
        !filters.minRooms ||
        (property.rooms ?? 0) >= Number(filters.minRooms);
      const matchesMaxRooms =
        !filters.maxRooms ||
        (property.rooms ?? 0) <= Number(filters.maxRooms);
      const matchesAmenities =
        !filters.amenities?.length ||
        filters.amenities.every((a) =>
          (property.amenities || []).includes(a)
        );

      return (
        matchesCity &&
        matchesType &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesMinSqm &&
        matchesMaxSqm &&
        matchesMinRooms &&
        matchesMaxRooms &&
        matchesAmenities
      );
    });

    setFilteredProperties(filtered);

    setTimeout(() => {
      propertyListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero - full width bg, inner content constrained */}
      <section
        className="relative flex flex-col items-center justify-center text-center text-white min-h-[90vh] bg-cover bg-center pt-32 sm:pt-40 pb-16"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <PageContainer>
          <div className="relative z-10 w-full max-w-4xl space-y-6">
            <h1 className="text-3xl sm:text-5xl font-bold">
              Discover Your Dream Property
            </h1>
            <p className="text-lg sm:text-xl text-gray-200">
              Thoughtfully curated properties for every lifestyle.
            </p>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md w-full text-black text-start">
              <FilterForm onFilter={handleFilter} />
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Category grid can stay as is */}
      <CategoryGrid countsBySlug={categoryCounts} loading={loading} />

      {/* Property list + info + enquiry all inside global container */}
      <PageContainer>
        <div ref={propertyListRef} className="py-12">
          {loading ? (
            <p>Loading properties…</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <PropertyList
              properties={filteredProperties}
              totalCount={allProperties.length}
            />
          )}
        </div>

     
      </PageContainer>

      <div style={{ backgroundColor: "#EDEAE3" }} className="py-12">
        <PageContainer>
          <div className="py-12">
            <InfoSection />
          </div>
        </PageContainer>
      </div>

      <PageContainer>
  

  {/* 🔥 Add this here — Radial Service section */}
  <div className="py-12 hidden md:block">
    <RadialServiceSlider />
  </div>

 
</PageContainer>

<PageContainer>
  {/* other sections */}
  <div className="py-12">
    <BlogList title="From our blog" limit={3} />
  </div>
</PageContainer>

<PageContainer>
  {/* other sections */}
  <div className="py-12">
    <TestimonialsSlider />
  </div>
</PageContainer>

<PageContainer>
  {/* other sections */}
  <div className="py-12">
    <FAQ />
  </div>
</PageContainer>



      <div style={{ backgroundColor: "#EDEAE3" }} className="py-5">
        <PageContainer>
          <div className="py-12">
            <Enquiry />
          </div>
        </PageContainer>
      </div>
     




    </div>
  );
};

export default Buy;
