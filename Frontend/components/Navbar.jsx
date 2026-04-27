import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaChevronDown,
  FaBars,
  FaTimes,
  FaUserAlt,
  FaArrowRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { MdVerified } from "react-icons/md";
import gsap from "gsap";
import Button from "./Button";
import hclogo from "../assets/humanitycallslogo.avif";
import { animateNavBar } from "../utils/animations";
import { useUser } from "../context/UserContext";
import axios from "axios";

const MenuButton = ({ isOpen, toggle }) => {
  return (
    <button
      onClick={toggle}
      className={`relative z-100 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 ${isOpen ? 'bg-blood/5 shadow-inner' : 'bg-black/5 hover:bg-black/10'}`}
    >
      <div className="relative w-6 h-[14px] flex flex-col justify-between items-end">
        <motion.span
          className="h-0.5 rounded-full bg-current"
          animate={{
            width: isOpen ? "100%" : "100%",
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 6 : 0,
            backgroundColor: isOpen ? "#c53030" : "#1a1a1a"
          }}
          transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.span
          className="h-0.5 rounded-full bg-current"
          animate={{
            width: isOpen ? "0%" : "70%",
            opacity: isOpen ? 0 : 1,
            backgroundColor: "#1a1a1a"
          }}
          transition={{ duration: 0.3 }}
        />
        <motion.span
          className="h-0.5 rounded-full bg-current"
          animate={{
            width: isOpen ? "100%" : "40%",
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -6 : 0,
            backgroundColor: isOpen ? "#c53030" : "#1a1a1a"
          }}
          transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        />
      </div>
    </button>
  );
};

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const [volunteerStatus, setVolunteerStatus] = useState(null);
  const [volunteerData, setVolunteerData] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      const token = sessionStorage.getItem("token");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/volunteers/my-status`,
          { headers, withCredentials: true },
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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const navigation = [
    {
      title: "Who We Are?",
      accent: "#6366f1", // Indigo
      links: [
        { label: "About Us", href: "/about" },
        { label: "Our Team", href: "/our-team" },
        { label: "Gallery", href: "/gallery" },
        { label: "Wall of Fame", href: "/wall-of-fame" },
        { label: "Support FAQ", href: "/faq" },
      ],
    },
    {
      title: "Our Projects",
      accent: "#10b981", // Emerald
      isMega: true,
      links: [
        { label: "Blood Donation", href: "/request-donors" },
        { label: "Animal Rescue", href: "/animal-rescue" },
        { label: "Poor & Needy", href: "/poor-needy" },
        { label: "CSR Activities", href: "/programs/csr_activities" },
        { label: "Community Cleanup", href: "/programs/community_cleanup" },
        { label: "Road Safety", href: "/programs/road_safety" },
        { label: "Health & Hygiene", href: "/programs/health_hygiene" },
        { label: "Youth Empowerment", href: "/programs/youth_empowerment" },
        { label: "Impact Archive", href: "/donations-made" },
      ],
    },
    {
      title: "Get Involved",
      accent: "#f59e0b", // Amber
      links: [
        { label: "Volunteer With Us", href: "/volunteer" },
        { label: "Collaborate", href: "/collaborate" },
        { label: "Become a Member", href: "/become-a-member" },
      ],
    },
    {
      title: "Resources",
      accent: "#f43f5e", // Rose
      links: [
        { label: "Donate Now", href: "/donate" },
        { label: "Blood Donation Form", href: "/blood-donation" },
        { label: "Find Donors", href: "/request-donors" },
        {
          label: "Contact Us",
          href: "#contact",
          onClick: (e) => {
            if (e) e.preventDefault();
            const contactSection = document.getElementById("contact");
            if (contactSection) {
              contactSection.scrollIntoView({ behavior: "smooth" });
            }
          },
        },
      ],
    },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav
      className="sticky top-0 z-50 bg-white border-b border-black/5 shadow-sm"
      ref={navRef}
    >
      <div className="max-w-none mx-auto px-[5%]">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 outline-none">
            <img
              src={hclogo}
              width="45"
              height="45"
              className="w-[45px] h-[45px] object-contain"
              alt="Humanity Calls logo"
            />
            <div className="flex flex-col">
              <span
                className="text-lg font-black text-blood leading-none"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Humanity Calls
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center h-full">
            <div className="flex items-center h-full">
              <Link to="/" className="relative px-5 py-2 group/nav">
                <span
                  className={`relative z-10 text-[13px] font-bold tracking-tight transition-colors duration-300 ${
                    isActive("/")
                      ? "text-blood"
                      : "text-black/60 group-hover/nav:text-blood"
                  }`}
                  style={{ fontFamily: '"Syne", sans-serif' }}
                >
                  Home
                </span>
                {isActive("/") && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-x-2 bottom-[-10px] h-1 bg-blood rounded-t-full"
                  />
                )}
              </Link>

              {navigation.map((group) => (
                <DropdownNavItem
                  key={group.title}
                  title={group.title}
                  links={group.links}
                  isMega={group.isMega}
                  accent={group.accent}
                  isActive={group.links.some((l) => isActive(l.href))}
                />
              ))}
            </div>

            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-black/5">
              {!user ? (
                <Link to="/become-a-member">
                  <motion.button
                    initial="initial"
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                    className="relative bg-[#1a1a1a] text-white text-[11px] font-black uppercase tracking-[0.1em] px-7 py-3 rounded-full shadow-lg border border-white/10 flex items-center gap-3 overflow-hidden transition-all group/login"
                    style={{ fontFamily: '"Syne", sans-serif' }}
                  >
                    {/* Center-to-Edge Fill Layer */}
                    <motion.div
                      variants={{
                        initial: { scaleX: 0, opacity: 0 },
                        hover: { scaleX: 1, opacity: 1 },
                      }}
                      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                      className="absolute inset-0 bg-purple-600 z-0 origin-center"
                    />

                    <span className="relative z-10">Login / Join</span>

                    <motion.div
                      variants={{
                        initial: { x: 0 },
                        hover: { x: -8 },
                      }}
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                      className="relative z-10 text-[10px]"
                    >
                      <FaUserAlt />
                    </motion.div>
                  </motion.button>
                </Link>
              ) : (
                <Link to="/profile" className="group/profile relative">
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all shadow-md group-hover:scale-105 active:scale-95 ring-1 ring-black/5 ${volunteerStatus === "active" ? "bg-primary" : "bg-primary text-white"}`}
                  >
                    {volunteerData?.profilePicture ? (
                      <img
                        src={volunteerData.profilePicture}
                        alt={user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-white text-base">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    {volunteerStatus === "active" && (
                      <MdVerified className="absolute -right-0.5 -bottom-0.5 text-blue-600 bg-white rounded-full text-xs shadow-sm" />
                    )}
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center pr-2">
            <MenuButton isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] bg-white overflow-hidden lg:hidden">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-dvh w-full flex flex-col overflow-y-auto"
            >
              <div className="flex flex-col min-h-full p-8 pb-32">
                <div className="flex justify-between items-center mb-10 shrink-0">
                  <Link
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={hclogo}
                      alt="Logo"
                      className="h-10 w-10 object-contain"
                    />
                    <span
                      className="text-xl font-black tracking-tighter text-blood"
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      Humanity Calls
                    </span>
                  </Link>
                </div>

                <div className="flex flex-col">
                  <Link
                    to="/"
                    className={`text-4xl font-black uppercase tracking-tighter py-6 border-b border-black/5 ${isActive("/") ? "text-blood" : "text-black/10"}`}
                    onClick={() => setIsOpen(false)}
                    style={{ fontFamily: '"Syne", sans-serif' }}
                  >
                    Home
                  </Link>

                  {navigation.map((group) => (
                    <MobileNavItem
                      key={group.title}
                      group={group}
                      closeMenu={() => setIsOpen(false)}
                      pathname={pathname}
                    />
                  ))}
                </div>

                <div className="mt-auto pt-10 grid grid-cols-2 gap-3 shrink-0">
                  {!user ? (
                    <>
                      <Link
                        to="/become-a-member?mode=login"
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <button 
                          className="w-full py-4 text-[10px] font-black tracking-widest uppercase rounded-2xl border border-black/10 bg-white text-black hover:bg-black/5 transition-all"
                          style={{ fontFamily: '"Syne", sans-serif' }}
                        >
                          Login
                        </button>
                      </Link>
                      <Link
                        to="/become-a-member?mode=signup"
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <button 
                          className="w-full py-4 text-[10px] font-black tracking-widest uppercase rounded-2xl bg-black text-white shadow-lg shadow-black/10 hover:bg-black/90 transition-all"
                          style={{ fontFamily: '"Syne", sans-serif' }}
                        >
                          Sign Up
                        </button>
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 p-4 bg-black/[0.03] rounded-2xl"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-white shadow-md overflow-hidden shrink-0">
                        {volunteerData?.profilePicture ? (
                          <img
                            src={volunteerData.profilePicture}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-black tracking-tight">{user.name}</p>
                        <p className="text-[10px] font-bold text-black/30 uppercase">
                          Verified Volunteer
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const DropdownNavItem = ({ title, links, isActive, isMega, accent }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative h-full flex items-center group/nav"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={`flex items-center gap-1.5 px-5 py-2 text-[13px] font-bold tracking-tight transition-all duration-300 ${
          isActive ? "text-blood" : "text-black/60 group-hover/nav:text-blood"
        }`}
        style={{
          fontFamily: '"Syne", sans-serif',
          color: isOpen ? accent : "",
        }}
      >
        {title}
        <FaChevronDown
          className={`text-[9px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
        {isActive && (
          <motion.span
            layoutId="nav-pill"
            className="absolute inset-x-2 bottom-[-10px] h-1 bg-blood rounded-t-full"
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`absolute top-full left-1/2 z-[100] ${isMega ? "w-[500px]" : "w-64"}`}
          >
            <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)] border-x border-b border-black/5 rounded-b-[2rem] overflow-hidden">
              <div
                className="h-[3px] w-full"
                style={{ backgroundColor: accent }}
              />
              <div
                className={`p-4 grid gap-1 ${isMega ? "grid-cols-2" : "grid-cols-1"}`}
              >
                {links.map((link) => (
                  <div key={link.label}>
                    {link.onClick ? (
                      <button
                        onClick={(e) => {
                          link.onClick(e);
                          setIsOpen(false);
                        }}
                        className="group/item w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.02] transition-all"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full scale-0 group-hover/item:scale-100 transition-transform"
                          style={{ backgroundColor: accent }}
                        />
                        <span
                          className="text-[13px] font-bold whitespace-nowrap text-black/50 group-hover/item:text-black transition-colors"
                          style={{ fontFamily: '"Poppins", sans-serif' }}
                        >
                          {link.label}
                        </span>
                      </button>
                    ) : (
                      <Link
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className="group/item flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.02] transition-all"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full scale-0 group-hover/item:scale-100 transition-transform"
                          style={{ backgroundColor: accent }}
                        />
                        <span
                          className="text-[13px] font-bold whitespace-nowrap text-black/50 group-hover/item:text-black transition-colors"
                          style={{ fontFamily: '"Poppins", sans-serif' }}
                        >
                          {link.label}
                        </span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileNavItem = ({ group, closeMenu, pathname }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isGroupActive = group.links.some((l) => l.href === pathname);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between py-6 text-4xl font-black uppercase tracking-tighter border-b border-black/5 text-left transition-colors ${
          isOpen || isGroupActive ? "" : "text-black/10"
        }`}
        style={{
          fontFamily: '"Syne", sans-serif',
          color: isOpen ? group.accent : isGroupActive ? group.accent : "",
        }}
      >
        {group.title}
        <FaChevronDown
          className={`text-xl transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-black/[0.01]"
          >
            <div className="flex flex-col gap-4 p-6">
              {group.links.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => {
                    if (link.onClick) link.onClick();
                    closeMenu();
                  }}
                  className={`text-xl font-bold tracking-tight hover:opacity-80 ${
                    pathname === link.href ? "opacity-100" : "opacity-30"
                  }`}
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    color: pathname === link.href ? group.accent : "",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
