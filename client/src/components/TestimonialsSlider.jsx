// src/components/TestimonialsCarousel.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

// Component for rendering a single testimonial card
const TestimonialCard = ({ t, dividerClass }) => (
  <div key={t.id} className={`px-3 w-full ${dividerClass}`}>
    <div className="flex flex-col h-full min-h-[320px] p-5 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full">
        
        {/* LEFT: Name + Subtitle */}
        <div className="md:flex-1 md:pr-4">
          <div className="text-lg md:text-xl font-semibold text-gray-900 leading-tight">
            {t.name}
          </div>
          <div className="text-base md:text-lg text-gray-500">
            {t.subtitle}
          </div>
        </div>

        {/* RIGHT: Stars */}
        <div className="flex items-center gap-1 flex-shrink-0 mt-2 md:mt-0 md:ml-4">
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
  const testimonials = [ /* your testimonial data… */ ];

  const sliderRef = useRef(null);
  const sliderMobileRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShowState, setSlidesToShowState] = useState(3);
  const total = testimonials.length;

  // Desktop slider
  const desktopSettings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: total > 3,
    speed: 600,
    arrows: false,
    dots: false,
    beforeChange: (_o, n) => setCurrentSlide(n),
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
    ],
  };

  // Mobile slider
  const mobileSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: total > 1,
    speed: 600,
    arrows: false,
    dots: false,
    beforeChange: (_o, n) => setCurrentSlide(n),
  };

  const updateSlidesToShow = useCallback(() => {
    const w = window.innerWidth;
    if (w < 768) setSlidesToShowState(1);
    else if (w < 1024) setSlidesToShowState(2);
    else setSlidesToShowState(3);
  }, []);

  useEffect(() => {
    updateSlidesToShow();
    window.addEventListener("resize", updateSlidesToShow);
    return () => window.removeEventListener("resize", updateSlidesToShow);
  }, [updateSlidesToShow]);

  const displayCurrent = String(currentSlide + 1).padStart(2, "0");
  const displayTotal = String(total).padStart(2, "0");
  const progressPercent = ((currentSlide + 1) / total) * 100;

  const prev = () => {
    if (window.innerWidth < 768) sliderMobileRef.current?.slickPrev();
    else sliderRef.current?.slickPrev();
  };

  const next = () => {
    if (window.innerWidth < 768) sliderMobileRef.current?.slickNext();
    else sliderRef.current?.slickNext();
  };

  const shouldShowDivider = (index) => {
    const pos = ((index - currentSlide) % total + total) % total;
    const visible = pos < slidesToShowState;
    const last = pos === slidesToShowState - 1;
    return visible && !last;
  };

  return (
    <section className="mt-12 mb-12">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* TOP */}
        <div className="flex items-start justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Your trust is our greatest award
          </h2>

          <button
            className="
              inline-flex items-center gap-2
              px-3 py-1.5 text-[11px]
              md:px-6 md:py-2 md:text-sm
              rounded-full border border-amber-600 text-amber-700 
              hover:bg-amber-50 transition
              ml-0 md:ml-6
              whitespace-nowrap
            "
          >
            Write a review →
          </button>
        </div>

        {/* MOBILE SLIDER */}
        <div className="md:-ml-3 md:hidden">
          <Slider ref={sliderMobileRef} {...mobileSettings}>
            {testimonials.map((t) => (
              <TestimonialCard t={t} dividerClass="" key={t.id} />
            ))}
          </Slider>
        </div>

        {/* DESKTOP SLIDER */}
        <div className="md:-ml-3 hidden md:block">
          <Slider ref={sliderRef} {...desktopSettings}>
            {testimonials.map((t, index) => {
              const dividerClass = shouldShowDivider(index)
                ? "border-r border-gray-300"
                : "";
              return <TestimonialCard t={t} dividerClass={dividerClass} key={t.id} />;
            })}
          </Slider>
        </div>

        {/* CONTROLS */}
        <div className="mt-2.5 flex items-center gap-6 w-full">

          {/* Counter - hidden on mobile */}
          <div className="hidden md:flex text-2xl font-light text-gray-900 shrink-0 items-center">
            <span className="font-semibold">{displayCurrent}</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500">{displayTotal}</span>
          </div>

          {/* Progress Line - hidden on mobile */}
          <div className="hidden md:block flex-1">
            <div className="h-[1px] bg-gray-200 w-full">
              <div
                className="h-[1px] bg-gray-900 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
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
