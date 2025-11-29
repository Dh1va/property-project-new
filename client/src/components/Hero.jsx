import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

export default function Hero() {
  const slides = [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
    "https://plus.unsplash.com/premium_photo-1661913412680-c274b6fea096?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1031",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  ];

  return (
    <div className="relative w-full overflow-hidden pt-10 md:pt-16">
      {/* Swiper */}
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        className="mySwiper"
      >
        {slides.map((url, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[90vh]">
              <img
                src={url}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
             
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button className="custom-prev cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 rounded-full p-2 sm:p-3 transition-colors">
        <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      <button className="custom-next cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 rounded-full p-2 sm:p-3 transition-colors">
        <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>
    </div>
  );
}
