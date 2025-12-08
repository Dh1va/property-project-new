import React from "react";

const PageContainer = ({ className = "", children }) => {
  return (
    <div
      className={` w-full mx-auto max-w-screen-xl   xl:max-w-screen-2xl    2xl:max-w-[1700px]    px-4    sm:px-6   lg:px-10   xl:px-14    2xl:px-20    ${className} `}   >
      {children}
    </div>
  );
};

export default PageContainer;
