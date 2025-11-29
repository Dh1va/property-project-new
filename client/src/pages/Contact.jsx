import React from "react";

import EnquiryFormSimple from "../components/EnquiryFormSimple";

const Contact = () => {
  return (
    <section className="bg-white text-black px-4 pt-32 sm:pt-40 pb-16">
      <div className="max-w-[800px] mx-auto px-6">
        <h1 className="text-3xl font-semibold text-center mb-12">
          CONTACT US
        </h1>

        {/* Only the Form */}
        <div className="bg-[#EDEAE3] rounded-2xl p-8 shadow-lg">
          <EnquiryFormSimple />
        </div>
      </div>
    </section>
  );
};

export default Contact;
