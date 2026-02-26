import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaGlobe, FaChevronDown, FaUserCircle } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import gsap from "gsap";
import Button from "./Button";
import hclogo from "../assets/humanitycallslogo.avif";
import { SOCIAL_LINKS } from "../constants";
import { animateNavBar, animateMobileMenuOpen } from "../utils/animations";
import { useUser } from "../context/UserContext";
import axios from "axios";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const [volunteerStatus, setVolunteerStatus] = useState(null);
  const [volunteerData, setVolunteerData] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = sessionStorage.getItem("token");
      if (!token || !user) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/volunteers/my-status`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.data.status !== "none") {
          setVolunteerStatus(response.data.status);
          setVolunteerData(response.data.volunteer);
        }
      } catch (error) {
        console.error("Error fetching volunteer status:", error);
      }
    };
    fetchStatus();
  }, [user]);

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
          '[data-animation="mobile-menu"]',
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
    { label: t("nav.volunteer"), href: "/volunteer" },
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

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => pathname === path;

  return (
    <nav
      className="sticky top-0 z-50 bg-bg border-b border-border shadow-sm"
      ref={navRef}
    >
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
              style={{ width: 50, height: 50, objectFit: "contain" }}
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
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 border-l pl-4 border-border">
              {!user ? (
                <>
                  <Link to="/become-a-member">
                    <Button
                      variant="outline"
                      className="text-[12px] py-2 px-3 min-h-[40px] font-semibold"
                    >
                      Login
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="relative group">
                  <Link
                    to="/profile"
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95 relative ${volunteerStatus === "active" ? "bg-primary ring-2 ring-primary/20 ring-offset-2" : "bg-primary text-white"}`}
                    title={user.name}
                  >
                    {volunteerData?.profilePicture ? (
                      <img
                        src={volunteerData.profilePicture}
                        alt={user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    {volunteerStatus === "active" && (
                      <MdVerified className="absolute -right-1.5 -bottom-1 text-blue-600 bg-white rounded-full text-base" />
                    )}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center space-x-3">
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
          className="lg:hidden bg-bg border-t border-border animate-fade-in pb-12 shadow-2xl overflow-y-auto max-h-[calc(100vh-80px)]"
          data-animation="mobile-menu"
        >
          <div className="px-4 pt-4 space-y-1">
            {user && (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={`px-4 py-4 rounded-xl border mb-4 flex items-center space-x-4 shadow-sm active:scale-[0.98] transition-all ${volunteerStatus === "active" ? "bg-gradient-to-r from-primary/5 to-white border-primary/20" : "bg-white border-border"}`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-inner relative ${volunteerStatus === "active" ? "bg-primary text-white" : "bg-primary text-white"}`}
                >
                  {volunteerData?.profilePicture ? (
                    <img
                      src={volunteerData.profilePicture}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                  {volunteerStatus === "active" && (
                    <MdVerified className="absolute -right-1 -bottom-1 text-primary bg-white rounded-full text-lg" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-text-body text-lg leading-tight flex items-center gap-1">
                    {user.name}
                    {volunteerStatus === "active" && (
                      <MdVerified className="text-primary text-base" />
                    )}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {volunteerStatus === "active"
                      ? "Verified Volunteer"
                      : "View Profile"}
                  </p>
                </div>
              </Link>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`block px-4 py-4 text-lg font-medium border-b border-border rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "text-primary bg-white"
                    : "text-text-body hover:bg-white hover:text-secondary"
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
                  ),
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-3 pt-10 px-4">
              {!user && (
                <Link to="/become-a-member" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full py-4 text-base font-bold"
                  >
                    Become a Member
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
