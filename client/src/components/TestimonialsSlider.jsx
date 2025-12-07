// src/components/TestimonialsCarousel.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

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

  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShowState, setSlidesToShowState] = useState(3);
  const total = testimonials.length;

  const settings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: total > 3,
    speed: 600,
    arrows: false,
    dots: false,
    beforeChange: (_oldIndex, newIndex) => setCurrentSlide(newIndex),
    responsive: [
      // tablet / small desktop
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      // mobile: single testimonial per slide
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
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

  const displayCurrent = String(currentSlide + 1).padStart(2, "0");
  const displayTotal = String(total).padStart(2, "0");
  const progressPercent = Math.min(100, Math.max(0, ((currentSlide + 1) / total) * 100));

  const prev = () => sliderRef.current?.slickPrev();
  const next = () => sliderRef.current?.slickNext();

  const shouldShowDivider = (index) => {
    const positionInWindow = ((index - currentSlide) % total + total) % total;
    const isVisible = positionInWindow < slidesToShowState;
    const isLastVisible = isVisible && positionInWindow === slidesToShowState - 1;
    return isVisible && !isLastVisible;
  };

  return (
    <section className="mt-12 mb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* TOP SECTION */}
        <div className="flex items-start justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Your trust is our greatest award
          </h2>

          <button
            className="
              inline-flex items-center gap-2 
              px-4 py-2 text-xs
              md:px-6 md:py-2 md:text-sm
              rounded-full border border-amber-600 text-amber-700 
              hover:bg-amber-50 transition
              ml-0 md:ml-6
            "
            aria-label="Write a review"
          >
            Write a review →
          </button>
        </div>

        {/* SLIDER - negative margin only on md+ to keep mobile neat */}
        <div className="md:-ml-3">
          <Slider ref={sliderRef} {...settings}>
            {testimonials.map((t, index) => {
              const dividerClass = shouldShowDivider(index) ? "border-r border-gray-300" : "border-r-0";

              return (
                <div key={t.id} className={`px-3 w-full ${dividerClass}`}>
                  <div className="flex flex-col h-full min-h-[350px] p-6 md:p-8">
                    {/* Header: NAME+SUBTITLE left, STARS right (kept on same row) */}
                    <div className="flex items-start justify-between w-full">
                      {/* Left: Name + subtitle */}
                      <div className="flex-1 pr-4">
                        <div className="text-xl font-semibold text-gray-900 leading-tight">{t.name}</div>
                        <div className="text-lg text-gray-500">{t.subtitle}</div>
                      </div>

                      {/* Right: Stars (prevent shrinking/wrapping) */}
                      <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < t.rating ? "text-amber-500" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Quote */}
                    <p className="text-[16px] text-gray-700 leading-relaxed flex-1 mt-4">
                      {t.quote}
                    </p>

                    {/* Date aligned at bottom */}
                    <div className="mt-auto text-base text-gray-500 pt-4">{t.date}</div>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="mt-2.5 flex items-center gap-6 w-full">
          {/* Left counter */}
          <div className="text-2xl font-light text-gray-900 shrink-0 flex items-center">
            <span className="font-semibold">{displayCurrent}</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500">{displayTotal}</span>
          </div>

          {/* Long progress line */}
          <div className="flex-1">
            <div className="h-[1px] bg-gray-200 w-full">
              <div
                className="h-[1px] bg-gray-900 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right arrows */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={prev}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-900 hover:text-white transition"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={next}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-900 hover:text-white transition"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
