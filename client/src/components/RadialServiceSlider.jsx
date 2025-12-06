// src/components/RadialServiceSlider.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * RadialServiceSlider — text animation removed
 *
 * - Text on the right now updates instantly (no fade/slide).
 * - Dot animation and curve behavior remain unchanged.
 * - Keeps smoother easing for dot motion.
 */

const SERVICES = [
  {
    title: "Renting out properties",
    subtitle: "Mira Homes",
    description:
      "Looking to rent out your property? We’ll help you set the right price, prepare the unit, take professional photos, and list it across top rental platforms.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Home financing",
    subtitle: "UAE Mortgages",
    description:
      "Compare and secure competitive mortgage offers from leading banks and financial institutions.",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Property resale",
    subtitle: "Expert guidance",
    description:
      "From pricing to negotiations, we handle the full resale journey so you get the best value with minimal hassle.",
    image:
      "https://images.unsplash.com/photo-1559599101-7466fe601f5a?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Home financing",
    subtitle: "UAE Mortgages",
    description:
      "Compare and secure competitive mortgage offers from leading banks and financial institutions.",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
  },
];

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='600'><rect fill='%23f3f4f6' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='20'>image</text></svg>";

const AUTOPLAY_DELAY = 9000;
const ANIM_DURATION = 2000;
const CENTER_THRESHOLD = 0.5; // when progress >= this, text shows the incoming item

// orbit / curve
const ORBIT_WIDTH = 420;
const ORBIT_HEIGHT = 760;
const P0 = { x: 180, y: -140 };
const P1 = { x: 260, y: 220 };
const P2 = { x: 260, y: 380 };
const P3 = { x: 180, y: 760 };

const T_TOP = 0.18;
const T_CENTER = 0.5;
const T_BOTTOM = 0.82;
const T_TOP_OUT = T_TOP - 0.12;
const T_BOTTOM_OUT = T_BOTTOM + 0.12;

const SCALE_SMALL = 0.78;
const SCALE_LARGE = 1.8;
const BASE_DIAMETER = 84;

const lerp = (a, b, t) => a + (b - a) * t;
// smoothstep easing for nicer motion
const easeInOut = (t) => {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
};

const SCALE_CSS_EASING = "cubic-bezier(0.22, 0.86, 0.36, 1)";

function bezierPoint(t) {
  const x =
    Math.pow(1 - t, 3) * P0.x +
    3 * Math.pow(1 - t, 2) * t * P1.x +
    3 * (1 - t) * Math.pow(t, 2) * P2.x +
    Math.pow(t, 3) * P3.x;
  const y =
    Math.pow(1 - t, 3) * P0.y +
    3 * Math.pow(1 - t, 2) * t * P1.y +
    3 * (1 - t) * Math.pow(t, 2) * P2.y +
    Math.pow(t, 3) * P3.y;
  return { x, y };
}

function bezierTangent(t) {
  const dx =
    -3 * Math.pow(1 - t, 2) * P0.x +
    (3 * Math.pow(1 - t, 2) - 6 * (1 - t) * t) * P1.x +
    (6 * (1 - t) * t - 3 * Math.pow(t, 2)) * P2.x +
    3 * Math.pow(t, 2) * P3.x;
  const dy =
    -3 * Math.pow(1 - t, 2) * P0.y +
    (3 * Math.pow(1 - t, 2) - 6 * (1 - t) * t) * P1.y +
    (6 * (1 - t) * t - 3 * Math.pow(t, 2)) * P2.y +
    3 * Math.pow(t, 2) * P3.y;
  return { dx, dy };
}

const RadialServiceSlider = () => {
  const count = SERVICES.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animation, setAnimation] = useState({ direction: null, startIndex: 0, progress: 0 });

  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  const startAnimation = (direction) => {
    if (!count) return;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
    setAnimation((prev) => {
      if (prev.direction) return prev;
      return { direction, startIndex: currentIndex, progress: 0 };
    });
  };

  const handleNext = () => startAnimation("next");
  const handlePrev = () => startAnimation("prev");

  useEffect(() => {
    if (!count) return;
    const id = setInterval(() => startAnimation("next"), AUTOPLAY_DELAY);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, currentIndex]);

  useEffect(() => {
    if (!animation.direction) return;
    const direction = animation.direction;

    const step = (now) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const raw = Math.min(1, elapsed / ANIM_DURATION);
      const eased = easeInOut(raw);
      setAnimation((prev) => ({ ...prev, progress: eased }));

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        // finalize index
        setCurrentIndex((prevIndex) =>
          direction === "next" ? (prevIndex + 1) % count : (prevIndex - 1 + count) % count
        );
        setAnimation({ direction: null, startIndex: 0, progress: 0 });
        startTimeRef.current = null;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startTimeRef.current = null;
      rafRef.current = null;
    };
  }, [animation.direction, animation.startIndex, count]);

  // compute visible dots and their path positions
  const computeVisibleItems = () => {
    if (!animation.direction) {
      const centerIndex = currentIndex;
      const topIndex = (centerIndex - 1 + count) % count;
      const bottomIndex = (centerIndex + 1) % count;
      return [
        { serviceIndex: topIndex, t: T_TOP, scale: SCALE_SMALL, type: "top" },
        { serviceIndex: centerIndex, t: T_CENTER, scale: SCALE_LARGE, type: "center" },
        { serviceIndex: bottomIndex, t: T_BOTTOM, scale: SCALE_SMALL, type: "bottom" },
      ];
    }

    const { direction, startIndex, progress } = animation;
    const p = progress;

    if (direction === "next") {
      const active = startIndex;
      const next = (startIndex + 1) % count;
      const newNext = (startIndex + 2) % count;
      const enterSmallStart = SCALE_SMALL * 0.85;
      const enterSmallScale = lerp(enterSmallStart, SCALE_SMALL, p);
      return [
        {
          serviceIndex: active,
          t: lerp(T_CENTER, T_TOP, p),
          scale: lerp(SCALE_LARGE, SCALE_SMALL, easeInOut(p)),
          type: "moving-to-top",
        },
        {
          serviceIndex: next,
          t: lerp(T_BOTTOM, T_CENTER, p),
          scale: lerp(SCALE_SMALL, SCALE_LARGE, easeInOut(p)),
          type: "moving-to-center",
        },
        {
          serviceIndex: newNext,
          t: lerp(T_BOTTOM_OUT, T_BOTTOM, p),
          scale: enterSmallScale,
          type: "entering-bottom",
        },
      ];
    } else {
      const active = startIndex;
      const prev = (startIndex - 1 + count) % count;
      const newPrev = (startIndex - 2 + count) % count;
      const enterSmallStart = SCALE_SMALL * 0.85;
      const enterSmallScale = lerp(enterSmallStart, SCALE_SMALL, p);
      return [
        {
          serviceIndex: newPrev,
          t: lerp(T_TOP_OUT, T_TOP, p),
          scale: enterSmallScale,
          type: "entering-top",
        },
        {
          serviceIndex: prev,
          t: lerp(T_TOP, T_CENTER, p),
          scale: lerp(SCALE_SMALL, SCALE_LARGE, easeInOut(p)),
          type: "moving-to-center",
        },
        {
          serviceIndex: active,
          t: lerp(T_CENTER, T_BOTTOM, p),
          scale: lerp(SCALE_LARGE, SCALE_SMALL, easeInOut(p)),
          type: "moving-to-bottom",
        },
      ];
    }
  };

  const visibleItems = computeVisibleItems();

  // choose which service text to display while animating:
  // if animation.progress >= CENTER_THRESHOLD show incoming (next/prev), else show start
  const getDisplayedServiceIndex = () => {
    if (!animation.direction) return currentIndex;
    const { direction, startIndex, progress } = animation;
    if (progress >= CENTER_THRESHOLD) {
      return direction === "next" ? (startIndex + 1) % count : (startIndex - 1 + count) % count;
    }
    return startIndex;
  };

  const displayedIndex = getDisplayedServiceIndex();
  const displayedService = SERVICES[displayedIndex] ?? SERVICES[0];
  const displayCurrent = String(currentIndex + 1).padStart(2, "0");
  const displayTotal = String(count).padStart(2, "0");

  return (
    <section className="py-24 overflow-visible">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="w-full lg:w-1/3 pt-4">
            <h2 className="text-4xl sm:text-5xl font-semibold mb-3">360° service</h2>
            <p className="text-lg text-gray-500">Not just a regular agency</p>
          </div>

          <div className="w-full lg:w-2/3 flex items-center gap-12">
            <div className="relative flex-shrink-0" style={{ width: ORBIT_WIDTH, height: ORBIT_HEIGHT, transform: "translateX(-90px)" }}>
              {/* curve under dots */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${ORBIT_WIDTH} ${ORBIT_HEIGHT}`} style={{ zIndex: 5 }}>
                <g transform="translate(70,0)">
                  <path d={`M ${P0.x} ${P0.y} C ${P1.x} ${P1.y}, ${P2.x} ${P2.y}, ${P3.x} ${P3.y}`} stroke="#d4d4d4" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                </g>
              </svg>

              {/* dots */}
              {visibleItems.map((item, idx) => {
                const si = item && typeof item.serviceIndex === "number" ? item.serviceIndex : null;
                if (si === null || si < 0 || si >= SERVICES.length) return null;

                const service = SERVICES[si] || {};
                const pos = bezierPoint(item.t);
                const tangent = bezierTangent(item.t);
                const angle = Math.atan2(tangent.dy, tangent.dx) * (180 / Math.PI);

                // horizontal nudge for bottom alignment (smoothed)
                let horizontalNudge = 0;
                if (item.t >= T_CENTER) {
                  const normalizedT = (item.t - T_CENTER) / (T_BOTTOM - T_CENTER || 1);
                  const easedN = easeInOut(Math.max(0, Math.min(1, normalizedT)));
                  horizontalNudge = -20 * easedN;
                }

                const outerTransform = `translate3d(${pos.x + horizontalNudge}px, ${pos.y + 50}px, 0) rotate(${angle}deg)`;
                const isCenter = item.scale > (SCALE_LARGE + SCALE_SMALL) / 2;
                const innerScale = item.scale;
                const opacity =
                  item.type && item.type.startsWith("entering") ? Math.min(1, 0.2 + (innerScale - SCALE_SMALL * 0.85) / (SCALE_SMALL - SCALE_SMALL * 0.85)) : 1;

                return (
                  <div
                    key={`${service.title || "svc"}-${si}-${idx}`}
                    className={`absolute ${isCenter ? "z-20" : "z-10"}`}
                    style={{
                      left: 0,
                      top: 0,
                      transform: outerTransform,
                      willChange: "transform, opacity",
                      backfaceVisibility: "hidden",
                      transition: `transform 600ms ${SCALE_CSS_EASING}, opacity 320ms linear`,
                    }}
                  >
                    <div
                      style={{
                        width: BASE_DIAMETER,
                        height: BASE_DIAMETER,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: `translate(-50%,-50%) rotate(${-angle}deg) scale(${innerScale})`,
                        transition: `transform 600ms ${SCALE_CSS_EASING}, opacity 320ms linear`,
                        willChange: "transform, opacity",
                        opacity,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "9999px",
                          overflow: "hidden",
                          background: "white",
                          border: "1px solid rgba(0,0,0,0.06)",
                          boxShadow: isCenter ? "0 14px 36px rgba(0,0,0,0.14)" : "0 6px 14px rgba(0,0,0,0.08)",
                          display: "block",
                        }}
                      >
                        <img src={service.image || PLACEHOLDER_IMAGE} alt={service.title || "service"} style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} loading="lazy" decoding="async" />
                      </div>

                      {!isCenter && (
                        <div style={{ position: "absolute", top: BASE_DIAMETER + 12, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: 14, color: "#4b5563", backgroundColor: "#F9FAFB", padding: "6px 8px", borderRadius: 6 }}>
                          {service.subtitle || ""}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TEXT COLUMN — no animation */}
            <div className="flex-1 max-w-md">
              <h3 className="text-2xl sm:text-3xl font-semibold mb-1">{displayedService.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{displayedService.subtitle}</p>
              <p className="text-gray-700 text-sm sm:text-base mb-6 leading-relaxed">{displayedService.description}</p>
             
            </div>
          </div>
        </div>

        {/* NAV */}
        <div className="mt-2 flex items-center gap-6 text-sm text-gray-700">
          <button type="button" onClick={() => startAnimation("prev")} className="p-2 rounded-full hover:bg-gray-100">←</button>
          <span className="tracking-wide text-base">
            {displayCurrent}
            <span className="text-gray-400"> / </span>
            <span className="text-gray-500">{displayTotal}</span>
          </span>
          <button type="button" onClick={() => startAnimation("next")} className="p-2 rounded-full hover:bg-gray-100">→</button>
        </div>
      </div>
    </section>
  );
};

export default RadialServiceSlider;
