import React, { useRef, useState } from "react";
import Slider from "react-slick";

/**
 * Props:
 *  - images: array of image URLs
 *  - title?: optional heading (defaults to "Project gallery")
 */
const PropertyGallery = ({ images = [], title = "Project gallery" }) => {
  const sliderRef = useRef(null);
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  const total = images.length;

  const settings = {
    infinite: total > 2,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    arrows: false,
    dots: false,
    beforeChange: (_oldIndex, newIndex) => setCurrent(newIndex),
    responsive: [
      {
        breakpoint: 1024, // below 1024px -> 1 image per slide
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const displayCurrent = String(Math.min(current + 1, total)).padStart(2, "0");
  const displayTotal = String(total).padStart(2, "0");
  const progressPercent = (Math.min(current + 1, total) / total) * 100;

  const goPrev = () => {
    if (sliderRef.current) sliderRef.current.slickPrev();
  };

  const goNext = () => {
    if (sliderRef.current) sliderRef.current.slickNext();
  };

  return (
    <section className="mt-6 mb-10">
      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">
        {title}
      </h2>

      {/* Slider */}
      <div className="relative">
        <Slider ref={sliderRef} {...settings}>
          {images.map((src, idx) => (
            <div key={idx} className="px-2">
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={src}
                  alt={`Project image ${idx + 1}`}
                  className="w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[460px] object-cover"
                />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Bottom bar: index + progress + arrows */}
      <div className="mt-6 flex items-center justify-between gap-4">
        {/* Left: 01 / 07 and progress line */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-sm md:text-base font-medium tracking-wide">
            <span>{displayCurrent}</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500">{displayTotal}</span>
          </div>
          <div className="h-px bg-gray-300 w-full">
            <div
              className="h-px bg-black transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400 hover:bg-black hover:text-white transition disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit"
          >
            {/* left arrow */}
            <span className="text-lg leading-none">&#8592;</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400 hover:bg-black hover:text-white transition disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit"
          >
            {/* right arrow */}
            <span className="text-lg leading-none">&#8594;</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PropertyGallery;
