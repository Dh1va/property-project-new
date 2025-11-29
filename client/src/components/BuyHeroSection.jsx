import React from "react";

const BuyHeroSection = () => {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center text-white h-[80vh] sm:h-[90vh] bg-cover bg-center pt-10 md:pt-16"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-4">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4">
          Discover Your Dream Property
        </h1>
        <p className="text-lg sm:text-xl mb-8">
          Find the perfect home or investment opportunity in Dubai.
        </p>

        {/* Form */}
        
      </div>
    </section>
  );
};

export default BuyHeroSection;
