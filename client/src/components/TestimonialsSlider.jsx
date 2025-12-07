// src/components/TestimonialsCarousel.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

// Single testimonial card
const TestimonialCard = ({ t, dividerClass }) => (
  <div className={`px-3 w-full ${dividerClass}`}>
    <div className="flex flex-col h-full min-h-[300px] p-5 md:p-8">

      {/* Header */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Name + subtitle */}
        <div className="md:flex-1 md:pr-4">
          <div className="text-lg md:text-xl font-semibold text-gray-900 leading-tight">
            {t.name}
          </div>
          <div className="text-base md:text-lg text-gray-500">
            {t.subtitle}
          </div>
        </div>

        {/* Right: stars */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 md:w-5 md:h-5 ${
                i < t.rating ? "text-amber-500" : "text-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quote */}
      <p className="text-[15px] md:text-[16px] text-gray-700 leading-relaxed flex-1 mt-4">
        {t.quote}
      </p>

      {/* Date */}
      <div className="mt-auto text-sm md:text-base text-gray-500 pt-4">
        {t.date}
      </div>
    </div>
  </div>
);

const TestimonialsSlider = () => {
  const testimonials = [
    {
      id: 1,
      name: "Johan Müller",
      subtitle: "Documents",
      quote:
        "I decided to expand my business and enter the Dubai market, but didn't know where to start. Mira helped me get all required licenses and paperwork done quickly.",
      date: "Aug 4, 2024",
      rating: 5,
    },
    {
      id: 2,
      name: "Yusef Karim",
      subtitle: "Apartments in Dubai",
      quote:
        "My wife and I were choosing apartments for weeks until Mira found the perfect listing and arranged an online viewing.",
      date: "Jul 28, 2024",
      rating: 5,
    },
    {
      id: 3,
      name: "Josef Kraus",
      subtitle: "Moved to Dubai",
      quote:
        "I moved to Dubai with my family thanks to Mira. They handled the budget, the process, and every bit of paperwork.",
      date: "Jul 21, 2024",
      rating: 5,
    },
    {
      id: 4,
      name: "Leila Ahmed",
      subtitle: "Investor",
      quote:
        "Excellent advisory and process transparency. Highly recommended for property investors.",
      date: "Jun 10, 2024",
      rating: 5,
    },
    {
      id: 5,
      name: "Arjun Patel",
      subtitle: "Seller",
      quote:
        "Sold my apartment faster than expected thanks to their strong marketing and negotiation.",
      date: "May 19, 2024",
      rating: 5,
    },
    {
      id: 6,
      name: "Sara Ali",
      subtitle: "Buyer",
      quote:
        "Found the perfect condo near my workplace thanks to the Mira team’s patience and guidance.",
      date: "Apr 2, 2024",
      rating: 5,
    },
  ];

  const total = testimonials.length;

  const sliderRef = useRef(null);
  const sliderMobileRef = useRef(null);

  const [desktopIndex, setDesktopIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [slidesToShowState, setSlidesToShowState] = useState(3);

  // Desktop slider
  const desktopSettings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: total > 3,
    arrows: false,
    speed: 600,
    afterChange: (i) => setDesktopIndex(i),
    responsive: [{ breakpoint: 1024, settings: { slidesToShow: 2 } }],
  };

  // Mobile slider
  const mobileSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    infinite: total > 1,
    speed: 600,
    afterChange: (i) => setMobileIndex(i),
  };

  const updateSlidesToShow = useCallback(() => {
    const w = window.innerWidth;
    if (w < 640) setSlidesToShowState(1);
    else if (w < 1024) setSlidesToShowState(2);
    else setSlidesToShowState(3);
  }, []);

  useEffect(() => {
    updateSlidesToShow();
    window.addEventListener("resize", updateSlidesToShow);
    return () => window.removeEventListener("resize", updateSlidesToShow);
  }, [updateSlidesToShow]);

  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const activeIndex = isMobile ? mobileIndex : desktopIndex;

  const displayIndex = Math.max(0, Math.min(activeIndex, total - 1));
  const displayCurrent = String(displayIndex + 1).padStart(2, "0");
  const displayTotal = String(total).padStart(2, "0");

  const progressPercent = ((displayIndex + 1) / total) * 100;

  // Navigation
  const prev = () => {
    if (window.innerWidth < 768) sliderMobileRef.current?.slickPrev();
    else sliderRef.current?.slickPrev();
  };

  const next = () => {
    if (window.innerWidth < 768) sliderMobileRef.current?.slickNext();
    else sliderRef.current?.slickNext();
  };

  const shouldShowDivider = (index) => {
    const position = ((index - (isMobile ? mobileIndex : desktopIndex)) % total + total) % total;
    return position < slidesToShowState - 1;
  };

  return (
    <section className="mt-6 mb-6">
      <div className="max-w-7xl mx-auto ">

        {/* TOP SECTION */}
        <div className="flex items-start justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Your trust is our greatest award
          </h2>

          <button
            className="
              hidden md:inline-flex items-center gap-2 
              px-3 py-1.5 text-[11px]
              md:px-6 md:py-2 md:text-sm
              rounded-full border border-amber-600 text-amber-700 
              hover:bg-amber-50 transition
              whitespace-nowrap ml-0 md:ml-6
            "
          >
            Write a review →
          </button>
        </div>

        {/* MOBILE SLIDER */}
        <div className="md:hidden">
          <Slider ref={sliderMobileRef} {...mobileSettings}>
            {testimonials.map((t) => (
              <TestimonialCard t={t} dividerClass="" key={t.id} />
            ))}
          </Slider>
        </div>

        {/* DESKTOP SLIDER */}
        <div className="hidden md:block md:-ml-3">
          <Slider ref={sliderRef} {...desktopSettings}>
            {testimonials.map((t, index) => (
              <TestimonialCard
                key={t.id}
                t={t}
                dividerClass={shouldShowDivider(index) ? "border-r border-gray-300" : ""}
              />
            ))}
          </Slider>
        </div>

        {/* BOTTOM CONTROLS + PROGRESS (NOW ALSO ON MOBILE) */}
        <div className="mt-4 flex items-center gap-4 w-full">

          {/* Left counter (desktop only) */}
          <div className="hidden md:flex text-2xl font-light text-gray-900 items-center">
            <span className="font-semibold">{displayCurrent}</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500">{displayTotal}</span>
          </div>

          {/* Progress Line — NOW VISIBLE ON ALL DEVICES */}
          <div className="flex-1">
            <div className="h-[1px] bg-gray-200 w-full">
              <div
                className="h-[1px] bg-gray-900 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={prev}
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-900 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <button
              onClick={next}
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-900 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
