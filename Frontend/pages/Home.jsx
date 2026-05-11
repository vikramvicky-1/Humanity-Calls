import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import HeroSection from "../components/HeroSection";
import { IMAGE_ALTS, PROGRAMS } from "../constants";
import {
  animateTitleIn,
  animateParagraphIn,
  animateCards,
} from "../utils/animations";
import PinnedStackingCards from "../components/PinnedStackingCards";
import EmergencyHomePopup from "../components/EmergencyHomePopup";
import EmergencyFundingSection from "../components/EmergencyFundingSection";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const prevVisibleCount = useRef(0);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setVisibleCount(4);
    }
  }, []);

  const handleLoadMore = () => {
    setVisibleCount(PROGRAMS.length);
  };

  useEffect(() => {
    const cards = document.querySelectorAll('[data-animation="program-card"]');
    const newCards = Array.from(cards).slice(prevVisibleCount.current);

    if (newCards.length > 0) {
      if (prevVisibleCount.current === 0) {
        // First batch, use ScrollTrigger
        gsap.fromTo(
          newCards,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: newCards[0],
              start: "top 85%",
              once: true,
            },
          },
        );
      } else {
        // Subsequent batches, animate immediately
        gsap.fromTo(
          newCards,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          },
        );
      }
    }
    prevVisibleCount.current = visibleCount;
  }, [visibleCount]);

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? 20 : 40;

    const ctx = gsap.context(() => {
      const bloodDonationSection = document.querySelector(
        '[data-animation="blood-section"]',
      );
      const bloodSectionImage = document.querySelector(
        '[data-animation="blood-image"]',
      );
      const poorNeedySection = document.querySelector(
        '[data-animation="poor-needy-section"]',
      );
      const poorNeedyImage = document.querySelector(
        '[data-animation="poor-needy-image"]',
      );
      const animalRescueSection = document.querySelector(
        '[data-animation="animal-rescue-section"]',
      );
      const animalRescueImage = document.querySelector(
        '[data-animation="animal-rescue-image"]',
      );
      const statSection = document.querySelector(
        '[data-animation="stat-section"]',
      );
      const cards = document.querySelectorAll('[data-animation="card"]');
      const helpImage = document.querySelector('[data-animation="help-image"]');
      const helpText = document.querySelector('[data-animation="help-text"]');
      const newsletterSection = document.querySelector(
        '[data-animation="newsletter-section"]',
      );

      if (bloodDonationSection) {
        gsap.fromTo(
          bloodDonationSection,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bloodDonationSection,
              start: "top 80%",
              end: "bottom 60%",
              once: true,
            },
          },
        );
      }

      if (bloodSectionImage) {
        gsap.set(bloodSectionImage, { willChange: "transform, opacity" });
        gsap.fromTo(
          bloodSectionImage,
          { opacity: 0, scale: 0.9, x: isMobile ? -20 : -40 },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bloodSectionImage,
              start: "top 80%",
              end: "bottom 60%",
              once: true,
            },
            onComplete: () =>
              gsap.set(bloodSectionImage, { willChange: "auto" }),
          },
        );
      }

      if (poorNeedySection) {
        gsap.fromTo(
          poorNeedySection,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: poorNeedySection,
              start: "top 80%",
              end: "bottom 60%",
              once: true,
            },
          },
        );
      }

      if (poorNeedyImage) {
        gsap.set(poorNeedyImage, { willChange: "transform, opacity" });
        gsap.fromTo(
          poorNeedyImage,
          { opacity: 0, scale: 0.9, x: isMobile ? 20 : 40 },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: poorNeedyImage,
              start: "top 80%",
              end: "bottom 60%",
              once: true,
            },
            onComplete: () => gsap.set(poorNeedyImage, { willChange: "auto" }),
          },
        );
      }

      if (animalRescueSection) {
        gsap.fromTo(
          animalRescueSection,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: animalRescueSection,
              start: "top 80%",
              end: "bottom 60%",
              once: true,
            },
          },
        );
      }

      if (animalRescueImage) {
        gsap.set(animalRescueImage, { willChange: "transform, opacity" });
        gsap.fromTo(
          animalRescueImage,
          { opacity: 0, scale: 0.9, x: isMobile ? -20 : -40 },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: animalRescueImage,
              start: "top 80%",
              end: "bottom 60%",
              once: true,
            },
            onComplete: () =>
              gsap.set(animalRescueImage, { willChange: "auto" }),
          },
        );
      }

      if (statSection) {
        gsap.fromTo(
          statSection,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out",
            scrollTrigger: {
              trigger: statSection,
              start: "top 80%",
              end: "bottom 60%",
              once: true,
            },
          },
        );
      }

      if (cards.length > 0) {
        animateCards(cards);
      }

      if (helpImage) {
        gsap.set(helpImage, { willChange: "transform, opacity" });
        gsap.fromTo(
          helpImage,
          { opacity: 0, scale: 0.9, x: isMobile ? 20 : 40 },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: helpImage,
              start: "top 80%",
              end: "bottom 60%",
              once: true,
            },
            onComplete: () => gsap.set(helpImage, { willChange: "auto" }),
          },
        );
      }

      if (helpText) {
        gsap.fromTo(
          helpText,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: helpText,
              start: "top 80%",
              end: "bottom 60%",
              once: true,
            },
          },
        );
      }

      if (newsletterSection) {
        gsap.fromTo(
          newsletterSection,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out",
            scrollTrigger: {
              trigger: newsletterSection,
              start: "top 80%",
              end: "bottom 60%",
              once: true,
            },
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [i18n.language]);

  return (
    <>
      <EmergencyHomePopup />
      <div ref={containerRef}>
        <SEO
          title="Humanity Calls | NGO for Blood Donation & Animal Rescue"
          description="Join Humanity Calls. We provide emergency blood donor support, help the needy, and conduct animal rescue operations. Volunteer today to make a difference."
        />

        {/* Hero Section */}
        <HeroSection />

        {/* Stacking Cards Section */}
        <PinnedStackingCards />

        <EmergencyFundingSection />

        {/* Highlight Mission Statement */}
        <section className="pb-20 pt-8 bg-white overflow-hidden pointer-events-none">
          <div className="max-w-none mx-auto px-[5%] text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
              className="flex flex-col items-center justify-center"
            >
              <h2 
                className="text-lg md:text-2xl lg:text-3xl tracking-tight text-[#1a1a1a] font-bold"
                style={{ fontFamily: '"Syne", sans-serif', textTransform: "uppercase" }}
              >
                1000+ donors and <span className="text-[#E74C3C] italic border-b-2 border-red-500/20">1 purpose</span> !
              </h2>
            </motion.div>
          </div>
        </section>

        {/* Programs & Projects */}
        <section id="programs" className="py-24 bg-[#fcf8f8] text-[#1a1a1a]">
          <div className="max-w-none mx-auto px-[5%]">
            <div className="text-center mb-20" data-animation="program-title">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-primary text-xs uppercase tracking-[0.4em] font-bold"
              >
                Our Impact
              </motion.span>
              <h2 className="text-4xl md:text-6xl font-bold mt-4 mb-6 pb-1 leading-tight text-[#1a1a1a]" style={{ fontFamily: '"Syne", sans-serif' }}>
                Programs & <span className="text-[#10B981] italic">Projects</span>
              </h2>
              <p className="max-w-xl mx-auto text-gray-500 text-base md:text-lg font-light leading-relaxed">
                {t("about.programs_para")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {PROGRAMS.slice(0, visibleCount).map((p, idx) => {
                const accentColors = [
                  "#10B981", // Emerald
                  "#F59E0B", // Amber
                  "#8B5CF6", // Violet
                  "#EF4444", // Rose
                  "#0EA5E9", // Sky
                  "#6366F1", // Indigo
                ];
                const accent = accentColors[idx % accentColors.length];

                return (
                  <Link
                    key={`${p.id}-${idx}`}
                    to={`/programs/${p.id}`}
                    className="group relative bg-white rounded-[32px] overflow-hidden transition-all duration-700 flex flex-col hover:-translate-y-4 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] border border-black/4"
                    data-animation="program-card"
                  >
                    <div className="absolute top-0 left-0 w-full h-1.5 z-20" style={{ backgroundColor: accent }} />
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out"
                        loading="lazy"
                        decoding="async"
                        width="400"
                        height="256"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                    <div className="p-6 pb-8 flex flex-col grow space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-[1.5px]" style={{ backgroundColor: accent }} />
                        <span className="text-[9px] uppercase tracking-[0.3em] font-black" style={{ color: accent }}>
                          Project {idx + 1}
                        </span>
                      </div>
                      <h3 
                        className="text-xl font-bold text-[#1a1a1a] group-hover:text-primary transition-colors h-14 line-clamp-2"
                        style={{ fontFamily: '"Syne", sans-serif', lineHeight: 1.1 }}
                      >
                        {t(`about.programs.${p.id}.title`)}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed grow line-clamp-3">
                        {t(`about.programs.${p.id}.desc`)}
                      </p>
                      <div className="pt-4">
                        <span 
                          className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group-hover:gap-5"
                          style={{ color: accent }}
                        >
                          Explore Case Study
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {visibleCount < PROGRAMS.length && (
              <div className="mt-24 flex justify-center pb-20">
                <motion.button
                  onClick={handleLoadMore}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-8 sm:px-14 lg:px-16 py-4 sm:py-6 lg:py-7 bg-white rounded-full transition-all duration-700 overflow-hidden border border-black/8 hover:border-[#4F46E5]/40 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)]"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-2xl scale-110" style={{ background: "conic-gradient(from 0deg, #4F46E5, #10B981, #F59E0B, #4F46E5)", animation: "spin 4s linear infinite" }} />
                  <div className="absolute inset-[2px] bg-white rounded-full z-0 group-hover:inset-[4px] transition-all duration-500" />
                  <motion.span className="relative z-10 text-[10px] sm:text-[12px] lg:text-[13px] font-black uppercase tracking-[0.1em] sm:tracking-[0.4em] lg:tracking-[0.5em] text-[#4F46E5] flex items-center gap-2 sm:gap-4 whitespace-nowrap">
                    <span className="hidden sm:block w-8 h-px bg-[#4F46E5]/20 group-hover:bg-[#4F46E5]/60 transition-all duration-500" />
                    Load Full Archive
                    <span className="hidden sm:block w-8 h-px bg-[#4F46E5]/20 group-hover:bg-[#4F46E5]/60 transition-all duration-500" />
                  </motion.span>
                </motion.button>
              </div>
            )}
          </div>
        </section>

        {/* How You Can Help Section */}
        <section className="bg-white py-24 overflow-hidden" data-animation="help-section">
          <div className="max-w-none mx-auto px-[5%]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative group" data-animation="help-image">
                <img
                  src="https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_800/v1767814233/humanity_how_can_i_help_xezom5.avif"
                  alt={IMAGE_ALTS.howCanIHelp}
                  className="rounded-[40px] w-full object-cover aspect-4/3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] group-hover:scale-[1.02] transition-transform duration-700"
                />
              </div>
              <div className="space-y-10" data-animation="help-text">
                <div className="space-y-4">
                  <span className="text-red-500 text-[10px] uppercase tracking-[0.4em] font-black">Action Required</span>
                  <h2 className="text-4xl md:text-6xl font-bold text-[#1a1a1a]" style={{ fontFamily: '"Syne", sans-serif' }}>
                    How Can You <span className="text-[#E74C3C] italic">Help?</span>
                  </h2>
                </div>
                <p className="text-lg md:text-xl text-gray-500 font-light leading-relaxed max-w-xl">{t("home.how_can_help_desc")}</p>
                <div className="pt-6">
                  <Link to="/volunteer">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="group relative px-12 py-5 bg-[#1a1a1a] text-white rounded-full transition-all duration-500 overflow-hidden shadow-2xl">
                      <span className="relative z-10 text-[13px] font-black uppercase tracking-[0.3em]">{t("volunteer.join_now")}</span>
                      <div className="absolute inset-0 bg-[#E74C3C] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Join The Movement! (Newsletter) */}
        <section className="py-32 bg-[#fcf8f8] border-t border-black/5" data-animation="newsletter-section">
          <div className="max-w-none mx-auto px-[5%] text-center">
            <div className="mb-16 space-y-4">
              <span className="text-indigo-500 text-[10px] uppercase tracking-[0.4em] font-black">Newsletter</span>
              <h2 className="text-4xl md:text-6xl font-bold text-[#1a1a1a]" style={{ fontFamily: '"Syne", sans-serif' }}>
                Join the <span className="text-[#4F46E5] italic">Movement!</span>
              </h2>
              <p className="max-w-xl mx-auto text-gray-500 text-lg md:text-xl font-light">{t("home.newsletter_desc")}</p>
            </div>
            <div className="relative max-w-xl mx-auto group">
              <input type="email" placeholder={t("home.email_placeholder")} className="w-full px-10 py-6 rounded-full bg-white border border-black/5 outline-none focus:border-indigo-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all text-lg pr-44" />
              <button className="absolute right-2 top-2 bottom-2 px-8 bg-[#4F46E5] text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-black transition-colors">{t("home.subscribe")}</button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
