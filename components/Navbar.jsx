import React, { useState, useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import Button from "./Button";
import hclogo from "../assets/humanitycallslogo.avif";
import { SOCIAL_LINKS } from "../constants";
import { animateNavBar, animateMobileMenuOpen } from "../utils/animations";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const navRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      animateNavBar();
    }, navRef);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      const ctx = gsap.context(() => {
        const mobileMenu = document.querySelector(
          '[data-animation="mobile-menu"]'
        );
        if (mobileMenu) {
          animateMobileMenuOpen(mobileMenu);
        }
      }, navRef);
      
      document.body.style.overflow = "hidden";
      
      return () => {
        ctx.revert();
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const navLinks = [
    { label: "About Us", href: "/about" },
    { label: "Poor/Needy", href: "/poor-needy" },
    { label: "Animal Rescue", href: "/animal-rescue" },
    { label: "Wall of Fame", href: "/wall-of-fame" },
  ];

  const dropdownLinks = [
    { label: "Donations Made", href: "/donations-made" },
    {
      label: "Contact Us",
      href: "#contact",
      onClick: (e) => {
        e.preventDefault();
        const contactSection = document.getElementById("contact");
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: "smooth" });
        }
      },
    },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md" ref={navRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2"
            data-animation="logo"
          >
            <img
              src={hclogo}
              width="50"
              height="50"
              style={{ minWidth: 50, minHeight: 50 }}
              alt="Humanity Calls logo"
            />
            <span className="text-xl font-bold text-[#B71C1C] tracking-tight">
              Humanity Calls
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                data-animation="nav-link"
                className={`font-medium transition-colors text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#B71C1C] ${
                  isActive(link.href)
                    ? "text-[#B71C1C]"
                    : "text-[#4A4A4A] hover:text-[#B71C1C]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setIsMoreOpen(true)}
              onMouseLeave={() => setIsMoreOpen(false)}
            >
              <button
                className={`font-medium flex items-center text-sm ${
                  dropdownLinks.some((link) => isActive(link.href))
                    ? "text-[#B71C1C]"
                    : "text-[#4A4A4A] hover:text-[#B71C1C]"
                }`}
                data-animation="nav-link"
              >
                More <span className="ml-1 text-[10px] opacity-50">▼</span>
              </button>
              {isMoreOpen && (
                <div className="absolute top-full left-0 w-48 bg-white shadow-xl border-t-4 border-[#B71C1C] py-2 animate-fade-in">
                  {dropdownLinks.map((link) =>
                    link.onClick ? (
                      <button
                        key={link.label}
                        onClick={link.onClick}
                        className="w-full text-left block px-4 py-3 text-sm text-[#4A4A4A] hover:bg-gray-50 hover:text-[#B71C1C] transition-colors focus:outline-none focus:ring-inset focus:ring-2 focus:ring-[#B71C1C]"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        key={link.label}
                        to={link.href}
                        className="block px-4 py-3 text-sm text-[#4A4A4A] hover:bg-gray-50 hover:text-[#B71C1C] transition-colors focus:outline-none focus:ring-inset focus:ring-2 focus:ring-[#B71C1C]"
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-4 ml-4 items-center">
              <Link to="/request-donors">
                <Button
                  variant={isActive("/request-donors") ? "primary" : "outline"}
                  className="text-[12px] py-2.5 px-4 min-h-[40px]"
                  data-animation="cta-button"
                >
                  Request For Donors
                </Button>
              </Link>
              <Link to="/donate">
                <Button
                  className={`text-[12px] py-2.5 px-4 shadow-md min-h-[40px] ${
                    isActive("/donate") ? "bg-[#8E1616]" : ""
                  }`}
                  data-animation="cta-button"
                >
                  Donate Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#1A1A1A] p-2"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="lg:hidden bg-white border-t animate-fade-in pb-8"
          data-animation="mobile-menu"
        >
          <div className="px-4 pt-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="block px-4 py-4 text-lg font-medium text-[#4A4A4A] hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:ring-inset focus:ring-2 focus:ring-[#B71C1C]"
                onClick={() => setIsOpen(false)}
                data-animation="mobile-link"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 px-4">
              <p className="text-xs uppercase text-[#9E9E9E] font-bold tracking-widest mb-4">
                More Services
              </p>
              <div className="grid grid-cols-1 gap-2">
                {dropdownLinks.map((link) =>
                  link.onClick ? (
                    <button
                      key={link.label}
                      onClick={(e) => {
                        link.onClick(e);
                        setIsOpen(false);
                      }}
                      className="block py-2 text-base font-medium text-[#4A4A4A] text-left focus:outline-none focus:ring-inset focus:ring-2 focus:ring-[#B71C1C] rounded px-1"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="block py-2 text-base font-medium text-[#4A4A4A] focus:outline-none focus:ring-inset focus:ring-2 focus:ring-[#B71C1C] rounded px-1"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-3 pt-8 px-4">
              <Link to="/request-donors" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full min-h-[48px] md:min-h-[44px]">
                  Request For Donors
                </Button>
              </Link>
              <Link to="/donate" onClick={() => setIsOpen(false)}>
                <Button className="w-full min-h-[48px] md:min-h-[44px]">Donate Now</Button>
              </Link>
            </div>

            {/* Mobile Social Icons */}
            <div className="pt-10 px-4 border-t mt-8">
              <p className="text-center text-xs text-[#9E9E9E] uppercase tracking-widest mb-6">
                Stay Connected
              </p>
              <div className="flex justify-center space-x-6">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9E9E9E] hover:text-[#B71C1C] transition-colors"
                  >
                    <social.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
