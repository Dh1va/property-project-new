import React from "react";

const InfoSection = () => {
  return (
    <section className="flex flex-col md:flex-row items-start justify-between bg-gray-50  gap-10 ">
      {/* 🏙️ Left Image */}
      <div className="md:w-1/2 flex justify-center md:justify-start">
        <img
          src="https://images.unsplash.com/photo-1711426793036-cc10917d34a9?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=870"
          alt="Luxury Property"
          className="rounded-2xl shadow-xl w-full max-w-lg md:max-w-xl h-[400px] md:h-[500px] object-cover"
        />
      </div>

      {/* 🧾 Right Content */}
      <div className="md:w-1/2 space-y-6 text-left md:text-left flex flex-col justify-start md:px-3 ">
        <h2 className="text-3xl md:text-6xl font-bold text-gray-900 mb-10 mt-5">
          Discover Your Perfect Home
        </h2>
        <p className="text-black text-lg mb-10">
          Explore our exclusive listings to find your dream property in the
          heart of Dubai. Whether you’re looking to buy, sell, or rent — we’re
          here to make your real estate journey seamless and rewarding.
        </p>
        <div>
          <button className=" text-black px-6 py-3 rounded-full font-medium border cursor-pointer transition w-auto">
            Discover More
          </button>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
