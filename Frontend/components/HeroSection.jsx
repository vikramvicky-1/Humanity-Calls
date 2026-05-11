import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import HeroCarousel from "./HeroCarousel";
import PrimaryCTA, { LayerHoverStyle } from "./Common/PrimaryCTA";
import hclogo from "../assets/humanitycallslogo.avif";

/* ═══════════════════════════════════════════════════════════════
   MULTILAYER CTA BUTTON
   Multiple color layers that fill from bottom → top
   with staggered delays on hover
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   SECONDARY CTA — Ghost button with subtle glow hover
   ═══════════════════════════════════════════════════════════════ */
const SecondaryCTA = ({ children, to, delay = 0, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.76, 0, 0.24, 1] }}
      className={className}
    >
      <Link
        to={to}
        className="group/sec relative flex sm:inline-flex justify-center items-center gap-2 rounded-full border-2 border-white/25 px-9 py-[18px] md:px-11 md:py-[22px] text-white font-medium text-[15px] md:text-base overflow-hidden transition-all duration-500 ease-smooth hover:border-white/50 hover:shadow-[0_0_30px_rgba(215,238,221,0.12)] w-full"
        style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 500,
          letterSpacing: "0.03em",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Subtle background sweep on hover */}
        <span
          className="absolute inset-0 rounded-full bg-white/0 transition-all duration-500 ease-smooth group-hover/sec:bg-white/8"
          aria-hidden="true"
        />
        <span className="relative z-10">{children}</span>
      </Link>
    </motion.div>
  );
};

/* ─── Decorative floating pill ─── */
const FloatingPill = ({ children, className = "", delay = 0, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, delay, ease: [0.34, 1.56, 0.64, 1] }}
    className={`absolute hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium backdrop-blur-md border border-white/10 shadow-lg ${className}`}
    style={{
      backgroundColor: `${color}20`,
      color: "#FFFFFF",
      fontFamily: '"Poppins", sans-serif',
    }}
  >
    {children}
  </motion.div>
);

/* ─── Animated stat counter ─── */
const StatBadge = ({ number, label, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.76, 0, 0.24, 1] }}
    className="flex flex-col items-center"
  >
    <span
      className="text-2xl md:text-3xl font-bold text-white"
      style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800 }}
    >
      {number}
    </span>
    <span
      className="text-[11px] uppercase tracking-[0.15em] text-white/50 mt-1"
      style={{ fontFamily: '"Poppins", sans-serif' }}
    >
      {label}
    </span>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION — Premium NGO Showcase
   ═══════════════════════════════════════════════════════════════ */
const HeroSection = () => {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const textY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.42, 0.62]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  // Stagger animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-svh flex items-center overflow-hidden"
      id="hero"
    >
      {/* Inject the hover style for multilayer fill */}
      <LayerHoverStyle />

      {/* ── Background: Carousel with parallax scale ── */}
      <motion.div className="absolute inset-0 z-0" style={{ scale }}>
        <HeroCarousel />
      </motion.div>

      {/* ── Gradient Overlay — Cinematic ── */}
      <motion.div
        className="absolute inset-0 z-1"
        style={{ opacity: overlayOpacity }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/35 to-black/12" />
        <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-black/10" />
      </motion.div>

      {/* ── Subtle grain texture ── */}
      <div
        className="absolute inset-0 z-2 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Decorative color orbs ── */}
      <div className="absolute inset-0 z-2 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(215,238,221,0.3) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(138,79,255,0.2) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,194,234,0.15) 0%, transparent 70%)",
          }}
        />
      </div>

      <FloatingPill
        className="top-[18%] right-[8%] z-5"
        delay={1.5}
        color="#D7EEDD"
      >
        <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
        1000+ Donors
      </FloatingPill>
      <FloatingPill
        className="bottom-[22%] right-[12%] z-5"
        delay={1.8}
        color="#FFC2EA"
      >
        <span className="w-2 h-2 rounded-full bg-pink animate-pulse" />
        Pan India
      </FloatingPill>
      <FloatingPill
        className="top-[35%] right-[5%] z-5"
        delay={2.1}
        color="#FF4D4D"
      >
        <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
        24/7 Emergency
      </FloatingPill>

      {/* ── Main Content ── */}
      <motion.div
        className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-8 md:px-[8%] lg:px-[10%] py-12 md:py-28 lg:py-32 mt-[-4rem] lg:mt-[-8rem]"
        style={{ y: textY }}
      >
        <motion.div
          className="max-w-3xl space-y-4 md:space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={i18n.language}
        >
          {/* ── Eyebrow badge ── */}
          <motion.div variants={itemVariants}>
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.2em] border border-white/15 backdrop-blur-sm"
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 500,
                color: "#D7EEDD",
                backgroundColor: "rgba(215, 238, 221, 0.08)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              Humanity Calls Trust®
            </span>
          </motion.div>

          {/* ── Heading ── */}
          <motion.h1
            variants={itemVariants}
            className="flex flex-col leading-[0.95] tracking-tight"
          >
            {/* Line 1: "FEED YOUR" — Syne bold uppercase */}
            <div
              className="flex items-center flex-nowrap whitespace-nowrap gap-3 md:gap-5 text-[clamp(1.1rem,6vw,4.5rem)] text-white/90 mb-1"
              style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
              }}
            >
              <span>{t("home.hero_title_help")}</span>
            </div>

            {/* Line 2: "Humanity" — Syne Bold with animated flowing gradient */}
            <span className="relative inline-block w-fit">
              <span
                className="hero-gradient-text text-[clamp(2.25rem,8.5vw,7rem)] relative z-10"
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  textTransform: "uppercase",
                }}
              >
                {t("home.hero_title_humanity")}
              </span>

              {/* Logo icon placed specifically over the 'Y' */}
              <div className="absolute -top-[140%] md:-top-[52%] -right-[7%] md:right-3.5 z-[100] flex items-center justify-center pointer-events-none">
                <motion.img
                  src={hclogo}
                  alt="Logo"
                  className="h-[1.8em] md:h-[6em] w-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
                  initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    y: [0, -20, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.8, delay: 0.8 },
                    scale: {
                      duration: 0.8,
                      delay: 0.8,
                      type: "spring",
                      stiffness: 200,
                    },
                    rotate: { duration: 0.8, delay: 0.8 },
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                />
              </div>

              {/* Decorative underline stroke */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.9,
                  ease: [0.76, 0, 0.24, 1],
                }}
                className="absolute -bottom-1 left-0 w-full h-[3px] origin-left"
                style={{
                  background:
                    "linear-gradient(90deg, #F7C948, #FF4D4D, #8A4FFF)",
                }}
              />
            </span>
          </motion.h1>

          {/* ── Subheading paragraph ── */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg lg:text-xl max-w-xl leading-relaxed"
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 300,
              color: "rgba(255, 255, 255, 0.75)",
              letterSpacing: "0.01em",
            }}
          >
            {t("home.hero_paragraph")}
          </motion.p>

          {/* ── CTAs ── */}
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-5 pt-2">
            <PrimaryCTA to="/donate" delay={0.9} className="w-full sm:w-auto">
              {t("nav.donate_now")}
            </PrimaryCTA>
            <SecondaryCTA
              to="/volunteer"
              delay={1.05}
              className="w-full sm:w-auto"
            >
              {t("home.volunteer_with_us")}
            </SecondaryCTA>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
