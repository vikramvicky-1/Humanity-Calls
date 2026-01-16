import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaGlobe, FaChevronDown } from "react-icons/fa";
import gsap from "gsap";
import Button from "./Button";
import hclogo from "../assets/humanitycallslogo.avif";
import { SOCIAL_LINKS } from "../constants";
import { animateNavBar, animateMobileMenuOpen } from "../utils/animations";

const LanguageSelector = ({ className }) => {
  const { i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef(null);

  const languages = [
    { code: "en", label: "English" },
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "te", label: "తెలుగు" },
    { code: "ta", label: "தமிழ்" },
    { code: "ml", label: "മലയാളം" },
    { code: "hi", label: "हिन्दी" },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={langRef}>
      <button
        onClick={() => setIsLangOpen(!isLangOpen)}
        className="flex items-center space-x-1.5 bg-bg border border-border text-text-body py-2 px-3 rounded-lg text-sm font-medium hover:border-primary hover:text-primary transition-all focus:outline-none shadow-sm"
      >
        <FaGlobe className="text-primary" />
        <span>{languages.find((l) => l.code === i18n.language)?.label || "Language"}</span>
        <FaChevronDown className={`text-[10px] transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
      </button>

      {isLangOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-white shadow-2xl rounded-xl border border-border py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                i18n.language === lang.code
                  ? "text-primary font-bold bg-blue-50/50"
                  : "text-text-body"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const navRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      animateNavBar();
    }, navRef);
    return () => ctx.revert();
  }, [i18n.language]);

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
    { label: t("nav.about_us"), href: "/about" },
    { label: t("nav.poor_needy"), href: "/poor-needy" },
    { label: t("nav.animal_rescue"), href: "/animal-rescue" },
    { label: t("nav.wall_of_fame"), href: "/wall-of-fame" },
  ];

  const dropdownLinks = [
    { label: t("nav.donations_made"), href: "/donations-made" },
    {
      label: t("nav.contact_us"),
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
    <nav className="sticky top-0 z-50 bg-bg border-b border-border shadow-sm" ref={navRef}>
      <div className="max-w-none mx-auto px-[5%]">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 outline-none"
            data-animation="logo"
          >
            <img
              src={hclogo}
              width="50"
              height="50"
              style={{ minWidth: 50, minHeight: 50 }}
              alt="Humanity Calls logo"
            />
            <span className="text-xl font-bold text-blood tracking-tight">
              Humanity Calls
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            <div className="flex items-center space-x-4 mr-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  data-animation="nav-link"
                  className={`font-medium transition-colors text-sm px-3 py-2 focus:outline-none ${
                    isActive(link.href)
                      ? "text-primary border-b-4 border-primary"
                      : "text-primary hover:text-secondary"
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
                  className={`font-medium flex items-center text-sm px-3 py-2 rounded-md transition-colors focus:outline-none ${
                    dropdownLinks.some((link) => isActive(link.href))
                      ? "text-primary border-b-4 border-primary"
                      : "text-primary hover:text-secondary"
                  }`}
                  data-animation="nav-link"
                >
                  {t("nav.more")}{" "}
                  <FaChevronDown className="ml-1.5 text-[10px] opacity-50" />
                </button>
                {isMoreOpen && (
                  <div className="absolute top-full left-0 w-48 bg-white shadow-xl border-t-4 border-primary py-2 animate-fade-in rounded-b-xl">
                    {dropdownLinks.map((link) =>
                      link.onClick ? (
                        <button
                          key={link.label}
                          onClick={link.onClick}
                          className="w-full text-left block px-4 py-3 text-sm text-text-body hover:bg-bg hover:text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {link.label}
                        </button>
                      ) : (
                        <Link
                          key={link.label}
                          to={link.href}
                          className="block px-4 py-3 text-sm text-text-body hover:bg-bg hover:text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {link.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 border-l pl-4 border-border">
              <Link to="/request-donors">
                <Button
                  variant="blood"
                  className="text-[12px] py-2 px-3 min-h-[40px] font-semibold"
                  data-animation="cta-button"
                >
                  {t("nav.request_for_donors")}
                </Button>
              </Link>
              <Link to="/donate">
                <Button
                  className={`text-[12px] py-2 px-3 shadow-md min-h-[40px] font-semibold ${
                    isActive("/donate") ? "brightness-110" : ""
                  }`}
                  data-animation="cta-button"
                >
                  {t("nav.donate_now")}
                </Button>
              </Link>
              <LanguageSelector className="ml-1" />
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center space-x-3">
            <LanguageSelector />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary p-2 hover:bg-border/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isOpen}
            >
              <svg
                className="w-7 h-7"
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
          className="lg:hidden bg-bg border-t border-border animate-fade-in pb-12 shadow-2xl"
          data-animation="mobile-menu"
        >
          <div className="px-4 pt-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`block px-4 py-4 text-lg font-medium border-b border-border rounded-lg transition-colors ${
                  isActive(link.href) ? "text-primary bg-white" : "text-text-body hover:bg-white hover:text-secondary"
                }`}
                onClick={() => setIsOpen(false)}
                data-animation="mobile-link"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 px-4">
              <p className="text-xs uppercase text-text-body/60 font-bold tracking-widest mb-4">
                {t("nav.more_services")}
              </p>
              <div className="grid grid-cols-1 gap-1">
                {dropdownLinks.map((link) =>
                  link.onClick ? (
                    <button
                      key={link.label}
                      onClick={(e) => {
                        link.onClick(e);
                        setIsOpen(false);
                      }}
                      className="block py-3 text-base font-medium text-text-body text-left hover:bg-white hover:text-secondary rounded-lg px-4 transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="block py-3 text-base font-medium text-text-body hover:bg-white hover:text-secondary rounded-lg px-4 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-3 pt-10 px-4">
              <Link to="/request-donors" onClick={() => setIsOpen(false)}>
                <Button
                  variant="blood"
                  className="w-full py-4 text-base font-bold"
                >
                  {t("nav.request_for_donors")}
                </Button>
              </Link>
              <Link to="/donate" onClick={() => setIsOpen(false)}>
                <Button className="w-full py-4 text-base font-bold">
                  {t("nav.donate_now")}
                </Button>
              </Link>
            </div>

            {/* Mobile Social Icons */}
            <div className="pt-12 px-4 border-t border-border mt-10">
              <p className="text-center text-xs text-text-body/60 uppercase tracking-widest mb-8 font-bold">
                {t("nav.stay_connected")}
              </p>
              <div className="flex justify-center space-x-8">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-body/60 hover:text-primary transition-colors p-2 hover:bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
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
