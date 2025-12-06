// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/images/podab-01.png";
import { slugify } from "../utils/slug";
import PageContainer from "./PageContainer";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Buy", path: "/buy" },
    { name: "Sell", path: "/seller/login" },
    {
      name: "Properties",
      submenu: [
        { name: "Agriland" },
        { name: "Apartment" },
        { name: "Commercial Building" },
        { name: "Commercial Land" },
        { name: "Houseplot" },
        { name: "Land" },
        { name: "Office" },
        { name: "Residential" },
        { name: "Retail" },
        { name: "Villa" },
      ],
    },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 80) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleNavigate = (area) => {
    navigate(`/properties/${slugify(area)}`);
    setMobileOpen(false);
    setOpenDropdown(null);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full bg-white shadow-md z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <PageContainer className="flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={Logo} alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
        </Link>

        {/* Desktop Menu */}
        {/* FIX: Reduced gap on md/lg to fit content, restored gap-8 on xl */}
        <div className="hidden md:flex items-center justify-center flex-1 gap-4 lg:gap-6 xl:gap-8 px-4">
          {navLinks.map((link, idx) => (
            <div
              key={idx}
              className="relative group"
              onMouseEnter={() => setOpenDropdown(link.name)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {link.submenu ? (
                <>
                  <button className="flex items-center gap-1 font-bold uppercase text-gray-900 hover:text-black transition text-sm lg:text-base">
                    {link.name}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <div
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-3 bg-white shadow-lg rounded-lg py-3 px-4 w-56 border transition-all duration-200 ${
                      openDropdown === link.name
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2"
                    }`}
                  >
                    {link.submenu.map((sub, j) => (
                      <button
                        key={j}
                        onClick={() => handleNavigate(sub.name)}
                        className="block w-full text-left px-3 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md text-medium"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={link.path}
                  className="font-bold uppercase text-gray-900 hover:text-black transition text-sm lg:text-base"
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Post Property */}
        <div className="hidden md:block flex-shrink-0">
          <Link
            to="/seller/login"
            onClick={() => setMobileOpen(false)}
            // FIX: Removed w-full, added text-sm for tablet, reduced padding
            className="inline-flex items-center justify-center rounded-full border border-black font-semibold uppercase overflow-hidden whitespace-nowrap"
          >
            <span className="px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm xl:text-base text-black transition-colors">
              Post Property
            </span>
            <span className="px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm xl:text-base bg-black text-white rounded-full">
              FREE
            </span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-900 cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </PageContainer>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t shadow-inner px-6 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {navLinks.map((link, idx) => (
            <div key={idx}>
              {link.submenu ? (
                <>
                  <button
                    className="flex items-center justify-between w-full text-left font-bold uppercase text-gray-900"
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === link.name ? null : link.name
                      )
                    }
                  >
                    {link.name}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openDropdown === link.name ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openDropdown === link.name && (
                    <div className="mt-2 pl-3 space-y-2 border-l-2 border-gray-100 ml-1">
                      {link.submenu.map((sub, j) => (
                        <button
                          key={j}
                          onClick={() => handleNavigate(sub.name)}
                          className="block w-full text-left text-gray-600 hover:text-black text-sm py-1"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={link.path}
                  className="block text-gray-900 font-bold uppercase hover:text-black"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}

          {/* FIXED MOBILE POST PROPERTY BUTTON: Removed w-full to make it content-driven */}
          <Link
            to="/seller/login"
            onClick={() => setMobileOpen(false)}
            // FIX: Changed 'flex' to 'inline-flex', removed 'w-full' and 'justify-between'
            className="inline-flex items-center rounded-full border border-black font-semibold uppercase overflow-hidden mt-4"
          >
            {/* FIX: Removed flex-1 and text-center, letting content dictate width */}
            <span className="px-5 py-2 text-black">
              Post Property
            </span>
            
            {/* FIX: Removed w-full and text-center */}
            <span className="px-4 py-2 bg-black text-white">
              FREE
            </span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;