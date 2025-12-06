import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import EnquiryFormSimple from "../components/EnquiryFormSimple";

const Contact = () => {
  return (
    <section className="bg-white text-gray-900 px-4 pt-24 sm:pt-32 pb-16">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-6">
          Get in Touch 
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          We're here to help! Whether you have questions about our services or need support, reach out and we'll connect you with the right expert.
        </p>

        {/* --- MAIN TWO-COLUMN LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* LEFT COLUMN: Contact Details (Map removed) */}
          <div className="space-y-10">
            
            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold border-b pb-2 border-gray-100">Contact Details</h2>
              
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-gray-900 flex-shrink-0 mt-1" /> {/* ICON COLOR CHANGED TO BLACK */}
                <div>
                  <h3 className="text-lg font-semibold">Our Office</h3>
                  <p className="text-gray-700">123 Business Tower, Sheikh Zayed Road, Dubai, UAE</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-gray-900 flex-shrink-0 mt-1" /> {/* ICON COLOR CHANGED TO BLACK */}
                <div>
                  <h3 className="text-lg font-semibold">Email Us</h3>
                  <p className="text-gray-700">support@yourcompany.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 text-gray-900 flex-shrink-0 mt-1" /> {/* ICON COLOR CHANGED TO BLACK */}
                <div>
                  <h3 className="text-lg font-semibold">Call Us</h3>
                  <p className="text-gray-700">+971 4 XXX XXXX</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* RIGHT COLUMN: Enquiry Form */}
          <div className="w-full">
            <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
            <div className="">
              <EnquiryFormSimple />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;