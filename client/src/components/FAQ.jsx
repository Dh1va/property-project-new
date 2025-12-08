import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const FAQ = () => {
  const title = "What might interest you";

  const items = [
    {
      id: 1,
      question: "What is off-plan real estate and is it worth investing in it?",
      answer:
        "Off-plan properties are sold before construction is completed. They offer lower entry prices and high capital appreciation, but require due diligence on developers and timelines."
    },
    {
      id: 2,
      question: "What is the difference between Leasehold and Freehold?",
      answer:
        "Freehold gives full ownership of the property and land. Leasehold grants long-term usage rights, typically 50–99 years, without land ownership."
    },
    {
      id: 3,
      question: "What is the minimum down payment required for a mortgage in the UAE?",
      answer:
        "UAE mortgages typically require 15–25% down payment depending on residency status and property price."
    },
    {
      id: 4,
      question: "Can I obtain a UAE residence permit by purchasing real estate?",
      answer:
        "Yes. UAE Golden Visa and other residency options are available for qualifying real-estate investments."
    },
    {
      id: 5,
      question: "What are the taxes and fees on real estate in the UAE?",
      answer:
        "Main fees include DLD transfer fee (4%), broker commission, property registration, and service charges. There is currently no annual property tax."
    },
    {
      id: 6,
      question: "Why is it worth investing in UAE real estate?",
      answer:
        "The UAE offers high rental yields, strong economic stability, zero income tax, and world-class infrastructure."
    },
    {
      id: 7,
      question: "Can I refinance my mortgage in the UAE?",
      answer:
        "Yes. Many banks allow refinancing for better interest rates or updated loan terms."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  const FAQRow = ({ item, i }) => {
    const contentRef = useRef(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    }, [contentRef, openIndex]);

    return (
      <div className="relative">
        {/* Row */}
        <div className="flex items-stretch justify-between px-6 py-6 md:py-8 cursor-pointer"
             onClick={() => toggle(i)}>
          
          {/* Question */}
          <h3 className="text-lg md:text-xl font-medium text-gray-900 leading-snug flex-1">
            {item.question}
          </h3>

          {/* Right Chevron Button — perfectly aligned */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent double toggle
              toggle(i);
            }}
            aria-label="Toggle FAQ"
            className={`
              w-10 h-10 rounded-full border border-gray-300 
              flex items-center justify-center ml-4
              transition-all duration-200
              ${openIndex === i ? "bg-gray-50" : "bg-white"}
            `}
          >
            <ChevronDown
              className={`
                w-5 h-5 text-gray-700 transition-transform duration-200
                ${openIndex === i ? "rotate-180" : "rotate-0"}
              `}
            />
          </button>
        </div>

        {/* Expandable Panel */}
        <div
          className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
          style={{ maxHeight: openIndex === i ? `${height}px` : "0px" }}
        >
          <div
            ref={contentRef}
            className="px-6 pb-6 md:pb-8 text-gray-700 text-base leading-relaxed"
          >
            {item.answer}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300" />
      </div>
    );
  };

  return (
    
  <section className="mt-12 mb-12">
    <div className="max-w-7xl mx-auto">

      {/* Centered Title at Top */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
      </div>

      {/* FAQ List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-12">
          {items.map((item, i) => (
            <FAQRow key={item.id} item={item} i={i} />
          ))}
        </div>
      </div>

    </div>
  </section>


  );
};

export default FAQ;
