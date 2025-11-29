import React from 'react'
import EnquiryFormSimple from './EnquiryFormSimple'

const Enquiry = () => {
  return (
    <div>
      <section className="flex flex-col md:flex-row items-start justify-between gap-10">
        {/* Left Content */}
        <div className="w-full md:w-1/2 space-y-6 text-left md:text-left flex flex-col justify-start md:px-3">
          <h2 className="text-3xl md:text-6xl font-bold text-gray-900 mb-10 mt-5">
            Book personal consultation
          </h2>
          <p className="text-black text-lg mb-10">
            We visit your laundry room to perform a needs analysis and energy calculation. Whether it's washing machines, dryers or other products, our specialists will help you find the right solution.
          </p>
          <p className="text-black text-lg mb-10">
            Fill out the form and we will contact you, or call us at <br /> 031-752 01 00.
          </p>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 space-y-6 text-left md:text-left flex flex-col justify-start md:px-3">
          <EnquiryFormSimple />
        </div>
      </section>
    </div>
  )
}

export default Enquiry
