// src/components/RadiantServiceSlider.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";

const SERVICES = [
  {
    title: "Renting out properties",
    subtitle: "Mira Homes",
    description:
      "Looking to rent out your property? We’ll help you set the right price, prepare the unit, take professional photos, and list it across top platforms.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
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

const PROGRESS_DURATION = 12000; // ms
const ORBIT_RADIUS = 200;
const CIRCLE_RADIUS = 90;

const RadiantServiceSlider = () => {
  const [slotItems, setSlotItems] = useState(() => {
    const count = SERVICES.length;
    if (!count) return [];
    const centerIndex = 0;
    const bottomIndex = (centerIndex + 1) % count;
    const topIndex = (centerIndex - 1 + count) % count;

    return [
      { slot: "top", serviceIndex: topIndex, instanceId: 1 },
      { slot: "center", serviceIndex: centerIndex, instanceId: 2 },
      { slot: "bottom", serviceIndex: bottomIndex, instanceId: 3 },
    ];
  });

  const [nextInstanceId, setNextInstanceId] = useState(4);
  const [progress, setProgress] = useState(0);
  const [enteringBottomId, setEnteringBottomId] = useState(null); // 👈 new
  const frameRef = useRef(null);

  const servicesCount = SERVICES.length;

  const centerItem = useMemo(
    () => slotItems.find((s) => s.slot === "center"),
    [slotItems]
  );

  const currentServiceIndex = centerItem?.serviceIndex ?? 0;
  const currentService = SERVICES[currentServiceIndex] || SERVICES[0];

  const circumference = 2 * Math.PI * CIRCLE_RADIUS;

  const getBySlot = (items, slot) => items.find((i) => i.slot === slot);

  // 🔁 autoplay radial progress
  useEffect(() => {
    if (!servicesCount) return;

    let start = performance.now();
    setProgress(0);

    const animate = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / PROGRESS_DURATION);
      setProgress(t * 100);

      if (t >= 1) {
        step("next");
      } else {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [currentServiceIndex, servicesCount]);

  // small effect to finish the "slide in" of new bottom
  useEffect(() => {
    if (enteringBottomId == null) return;
    const t = setTimeout(() => setEnteringBottomId(null), 40); // allow one frame in "outside orbit" state
    return () => clearTimeout(t);
  }, [enteringBottomId]);

  const step = (direction) => {
    if (!servicesCount) return;

    setSlotItems((prev) => {
      if (prev.length < 3) return prev;

      const top = getBySlot(prev, "top");
      const center = getBySlot(prev, "center");
      const bottom = getBySlot(prev, "bottom");
      if (!center || !bottom) return prev;

      let newTop, newCenter, newBottom;
      let newBottomInstanceId = nextInstanceId;

      if (direction === "next") {
        const newBottomServiceIndex =
          (bottom.serviceIndex + 1) % servicesCount;

        newTop = {
          slot: "top",
          serviceIndex: center.serviceIndex,
          instanceId: center.instanceId,
        };

        newCenter = {
          slot: "center",
          serviceIndex: bottom.serviceIndex,
          instanceId: bottom.instanceId,
        };

        newBottom = {
          slot: "bottom",
          serviceIndex: newBottomServiceIndex,
          instanceId: newBottomInstanceId,
        };

        // mark this bottom as "entering from edge"
        setEnteringBottomId(newBottomInstanceId);
      } else {
        const newTopServiceIndex =
          (top?.serviceIndex - 1 + servicesCount) % servicesCount;

        newTop = {
          slot: "top",
          serviceIndex: newTopServiceIndex,
          instanceId: newBottomInstanceId,
        };

        newCenter = {
          slot: "center",
          serviceIndex: top?.serviceIndex ?? center.serviceIndex,
          instanceId: top?.instanceId ?? center.instanceId,
        };

        newBottom = {
          slot: "bottom",
          serviceIndex: center.serviceIndex,
          instanceId: center.instanceId,
        };

        setEnteringBottomId(null); // no special slide-in when going backwards
      }

      setNextInstanceId((id) => id + 1);
      setProgress(0);

      return [newTop, newCenter, newBottom];
    });
  };

  const handleManualNext = () => step("next");
  const handleManualPrev = () => step("prev");

  // 🌀 orbit helpers
  const getSlotAngle = (slot) => {
    if (slot === "top") return -70;
    if (slot === "bottom") return 70;
    return 0;
  };

  const getTransformForSlot = (slot, isEntering) => {
    const angleDeg = getSlotAngle(slot);
    const rad = (angleDeg * Math.PI) / 180;

    // 👉 for entering bottom, start slightly outside the orbit
    const baseRadius = slot === "bottom" && isEntering
      ? ORBIT_RADIUS + 60
      : ORBIT_RADIUS;

    const x = -Math.cos(rad) * baseRadius;
    const y = Math.sin(rad) * baseRadius;

    const isCenter = slot === "center";
    const scale = isCenter ? 1 : 0.6;

    return {
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
    };
  };

  const displayCurrent = String(currentServiceIndex + 1).padStart(2, "0");
  const displayTotal = String(servicesCount).padStart(2, "0");

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-16 items-start">
        {/* LEFT: orbit */}
        <div className="relative w-[460px] h-[520px] mx-auto lg:mx-0">
          {/* black half-circle orbit */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 500 500"
          >
            {(() => {
              const cx = 250;
              const cy = 250;
              const r = ORBIT_RADIUS;
              const d = `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r}`;
              return (
                <path
                  d={d}
                  fill="none"
                  stroke="black"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })()}
          </svg>

          {/* 3 circles on orbit */}
          {slotItems.map((item) => {
            const service = SERVICES[item.serviceIndex];
            if (!service) return null;

            const isCenter = item.slot === "center";
            const isEntering =
              item.slot === "bottom" && item.instanceId === enteringBottomId;

            return (
              <div
                key={item.instanceId}
                style={getTransformForSlot(item.slot, isEntering)}
                className={`
                  absolute left-1/2 top-1/2
                  -translate-x-1/2 -translate-y-1/2
                  transition-transform transition-opacity
                  duration-[900ms] ease-out
                  flex flex-col items-center
                  ${item.slot === "top" ? "z-10" : ""}
                  ${item.slot === "center" ? "z-20" : ""}
                  ${item.slot === "bottom" ? "z-10" : ""}
                  ${isEntering ? "opacity-0" : "opacity-100"}
                `}
              >
                <div
                  className={`
                    rounded-full overflow-hidden bg-white
                    ${isCenter ? "w-48 h-48 shadow-xl" : "w-16 h-16 border border-gray-300 shadow-sm"}
                    transition-all duration-[900ms] ease-out
                  `}
                >
                  {isCenter ? (
                    <div className="relative w-full h-full">
                      {/* radial progress ring */}
                      <svg
                        className="w-full h-full -rotate-90"
                        viewBox="0 0 200 200"
                      >
                        <circle
                          cx="100"
                          cy="100"
                          r={CIRCLE_RADIUS}
                          stroke="#e5e7eb"
                          strokeWidth="5"
                          fill="transparent"
                        />
                        <circle
                          cx="100"
                          cy="100"
                          r={CIRCLE_RADIUS}
                          stroke="black"
                          strokeWidth="5"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={
                            circumference * (1 - progress / 100)
                          }
                          strokeLinecap="round"
                          style={{
                            transition: "stroke-dashoffset 0.12s linear",
                          }}
                        />
                      </svg>
                      <div className="absolute inset-6 rounded-full overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {!isCenter && (
                  <p className="text-[11px] text-gray-700 mt-2 max-w-[120px] text-center leading-tight">
                    {service.title}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT: text for current service */}
        <div className="flex-1 mt-6 lg:mt-0">
          <h2 className="text-4xl sm:text-5xl font-semibold mb-3">
            360° service
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Not just a regular agency
          </p>

          <div className="flex items-center gap-4 mb-8 text-sm text-gray-700">
            <button
              type="button"
              onClick={handleManualPrev}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              ←
            </button>

            <span className="tracking-wide">
              {displayCurrent}
              <span className="text-gray-400"> / </span>
              <span className="text-gray-500">{displayTotal}</span>
            </span>

            <button
              type="button"
              onClick={handleManualNext}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              →
            </button>
          </div>

          <h3 className="text-2xl sm:text-3xl font-semibold mb-1">
            {currentService.title}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {currentService.subtitle}
          </p>
          <p className="text-gray-700 text-sm sm:text-base mb-4 leading-relaxed">
            {currentService.description}
          </p>

          <button className="text-sm font-medium text-orange-600 hover:underline">
            Learn more
          </button>
        </div>
      </div>
    </section>
  );
};

export default RadiantServiceSlider;
