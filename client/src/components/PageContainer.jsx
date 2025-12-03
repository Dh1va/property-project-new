// src/components/PageContainer.jsx
import React from "react";

const PageContainer = ({ className = "", children }) => {
  return (
    <div
      className={`
        max-w-[1400px] mx-auto
        px-4      /* mobile */
        sm:px-6   /* tablets */
        lg:px-10  /* 1024px and ABOVE (desktop, large screens, ultrawide) */
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default PageContainer;
