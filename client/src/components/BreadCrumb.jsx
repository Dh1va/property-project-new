import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ items = [] }) => {
  const toTitleCase = (text = "") =>
    text
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <nav className="text-sm text-gray-600 mb-6 flex items-center gap-2">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span>{">"}</span>}

          {item.path ? (
            <Link
              to={item.path}
              className="hover:underline hover:text-black"
            >
              {toTitleCase(item.label)}
            </Link>
          ) : (
            <span className="font-semibold text-black">
              {toTitleCase(item.label)}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
