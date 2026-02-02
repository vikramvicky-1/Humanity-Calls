import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import HeroCarousel from "../components/HeroCarousel";
import hclogo from "../assets/humanitycallslogo.avif";
import { IMAGE_ALTS, PROGRAMS } from "../constants";
import {
  animateTitleIn,
  animateParagraphIn,
  animateCards,
} from "../utils/animations";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const prevVisibleCount = useRef(0);

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
      const heroTitle = document.querySelector('[data-animation="hero-title"]');
      const heroParagraph = document.querySelector(
        '[data-animation="hero-paragraph"]',
      );
      const heroImage = document.querySelector('[data-animation="hero-image"]');
      const heroGlow = document.querySelector('[data-animation="hero-glow"]');
      const heroButtons = document.querySelectorAll(
        '[data-animation="hero-button"]',
      );
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

      if (!isMobile) {
        if (heroTitle) {
          animateTitleIn(heroTitle);
        }

        if (heroParagraph) {
          animateParagraphIn(heroParagraph);
        }

        if (heroButtons.length > 0) {
          gsap.fromTo(
            heroButtons,
            { opacity: 0, y: yOffset, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              stagger: 0.15,
              delay: 0.6,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: heroButtons[0],
                start: "top 95%",
                once: true,
              },
            },
          );
        }

        if (heroGlow) {
          gsap.fromTo(
            heroGlow,
            { opacity: 0, scale: 0.5 },
            {
              opacity: 1,
              scale: 1.2,
              duration: 2,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            },
          );
        }

        if (heroImage) {
          gsap.set(heroImage, { willChange: "transform, opacity" });
          gsap.fromTo(
            heroImage,
            { opacity: 0, scale: 0.8, x: 100, rotate: 5 },
            {
              opacity: 1,
              scale: 1,
              x: 0,
              rotate: 0,
              duration: 1.2,
              ease: "elastic.out(1, 0.75)",
              scrollTrigger: {
                trigger: heroImage,
                start: "top 80%",
                once: true,
              },
              onComplete: () => {
                gsap.set(heroImage, { willChange: "auto" });
                gsap.to(heroImage, {
                  y: 15,
                  duration: 2,
                  repeat: -1,
                  yoyo: true,
                  ease: "power1.inOut",
                });
              },
            },
          );
        }
      } else {
        if (heroImage) {
          gsap.set(heroImage, { opacity: 1, scale: 1, x: 0, rotate: 0 });
        }
      }

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
    <div ref={containerRef}>
      <SEO
        title="Humanity Calls | NGO for Blood Donation & Animal Rescue"
        description="Join Humanity Calls. We provide emergency blood donor support, help the needy, and conduct animal rescue operations. Volunteer today to make a difference."
      />

      {/* Hero Section */}
      <section className="relative py-16 flex items-center overflow-hidden">
        <div className="absolute inset-0 px-[5%] py-4">
          <div className="relative w-full h-full overflow-hidden">
            <HeroCarousel />
          </div>
        </div>
        <div className="max-w-none mx-auto px-[10%] w-full relative z-10 py-12">
          <div className="max-w-3xl space-y-8">
            <h1
              key={i18n.language}
              className="flex flex-col font-bold leading-tight"
              data-animation="hero-title"
            >
              <span
                className="text-3xl md:text-5xl text-white/80 mb-2 drop-shadow-md"
                style={{
                  WebkitTextStroke: "2px rgba(40,175,176,0.8)",
                  paintOrder: "stroke fill",
                }}
              >
                {t("home.hero_title_help")}
              </span>
              <span className="relative inline-flex items-center group">
                <span
                  className="text-6xl md:text-8xl relative z-10 bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent animate-gradient-text drop-shadow-[0_0_1px_rgba(40,175,176,0.8)]"
                  style={{
                    WebkitTextStroke: "1.5px rgba(40,175,176,0.4)",
                    paintOrder: "stroke fill",
                  }}
                >
                  {t("home.hero_title_humanity")}
                </span>

                <span className="inline-flex items-center ml-4">
                  <span className="inline-block animate-bounce">
                    <img
                      src={hclogo}
                      alt="logo"
                      className="w-10 h-10 md:w-16 md:h-16 filter drop-shadow-[0_0_15px_rgba(40,175,176,0.6)]"
                    />
                  </span>
                </span>
              </span>
            </h1>
            <p
              className="text-xl text-white/90 max-w-lg leading-relaxed"
              data-animation="hero-paragraph"
            >
              {t("home.hero_paragraph")}
            </p>
            <div className="flex flex-wrap gap-6 lg:gap-4">
              <Link to="/collaborate">
                <Button
                  className="inline-flex items-center justify-center min-h-[48px] px-8 py-4 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition shadow-lg"
                  data-animation="hero-button"
                >
                  {t("home.collaborate_with_us")}
                </Button>
              </Link>
              <Link to="/volunteer">
                <Button
                  variant="white"
                  data-animation="hero-button"
                  className="bg-secondary !hover:bg-transparent !text-primary"
                >
                  {t("home.volunteer_with_us")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Poor/Needy Section */}
      <section
        className="bg-[#1a1c2c] text-white py-24 overflow-hidden"
        data-animation="poor-needy-section"
      >
        <div className="max-w-none mx-auto px-[5%]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative lg:order-2 px-4 md:px-0">
              <div className="absolute inset-0 bg-secondary/10 blur-3xl rounded-full -z-10"></div>
              <img
                src="https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_800,c_limit/v1767814233/humanity_calls_poor_needy_oef47s.avif"
                alt={IMAGE_ALTS.poorNeedy}
                data-animation="poor-needy-image"
                className="rounded-2xl border border-white/10 w-full object-cover aspect-[3/2] shadow-2xl"
                width="800"
                height="533"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="space-y-6 lg:order-1">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                {t("home.help_poor_needy_title")}
              </h2>
              <p className="text-lg text-white/70 leading-relaxed max-w-xl">
                {t("home.poor_needy_paragraph")}
              </p>
              <Link to="/poor-needy" className="inline-block">
                <Button
                  variant="white"
                  className="!bg-white !text-[#1a1c2c] hover:!bg-primary hover:!text-white transition-all"
                >
                  {t("home.support_today")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Animal Rescue Section */}
      <section
        className="bg-[#0f1f0f] text-white py-24 overflow-hidden"
        data-animation="animal-rescue-section"
      >
        <div className="max-w-none mx-auto px-[5%]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative px-4 md:px-0">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full -z-10"></div>
              <img
                src="https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_800,c_limit/v1767814232/humanity_calls_animal_resque_dxz9jb.avif"
                alt={IMAGE_ALTS.animalRescue}
                data-animation="animal-rescue-image"
                className="rounded-2xl border border-white/10 w-full object-cover aspect-[3/2] shadow-2xl"
                width="800"
                height="533"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                {t("home.animal_rescue_title")}
              </h2>
              <p className="text-lg text-white/70 leading-relaxed max-w-xl">
                {t("home.animal_rescue_paragraph")}
              </p>
              <Link to="/animal-rescue" className="inline-block">
                <Button
                  variant="white"
                  className="!bg-white !text-[#0f1f0f] hover:!bg-primary hover:!text-white transition-all"
                >
                  {t("home.rescue_today")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Blood Donation Section */}
      <section
        className="bg-blood text-white py-24 overflow-hidden border-y border-border"
        data-animation="blood-section"
      >
        <div className="max-w-none mx-auto px-[5%]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                {t("home.donate_blood_save_lives")}
              </h2>
              <p className="text-lg text-white/90 leading-relaxed">
                {t("home.blood_donation_paragraph")}
              </p>
              <Link to="/donate">
                <Button
                  variant="white"
                  className="!bg-white !text-[#1a1c2c] hover:!bg-primary hover:!text-white transition-all"
                >
                  {t("home.donate_today")}
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full -z-10"></div>
              <img
                src="https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_800/v1767814232/hc_blood_donation_mfwveo.png"
                alt={IMAGE_ALTS.bloodDonation}
                data-animation="blood-image"
                className="rounded-2xl border border-white/20 w-full object-cover aspect-[3/2]"
                width="800"
                height="533"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className="bg-bg py-20 border-b border-border"
        data-animation="stat-section"
      >
        <div className="max-w-none mx-auto px-[5%] text-center">
          <p className="text-3xl md:text-4xl font-bold text-primary">
            <Trans
              i18nKey="home.donors_count"
              components={{ red: <span className="text-blood" /> }}
            />
          </p>
        </div>
      </section>

      {/* Programs & Projects */}

      <section className="py-24 bg-[#1A1A1A] text-white">
        <div className="max-w-none mx-auto px-[5%]">
          <div className="text-center mb-16" data-animation="program-title">
            <h2 className="text-4xl font-bold mb-6 text-white">
              {t("about.programs_title")}
            </h2>
            <p className="max-w-2xl mx-auto text-gray-400 lowercase">
              {t("about.programs_para")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROGRAMS.slice(0, visibleCount).map((p, idx) => (
              <div
                key={`${p.id}-${idx}`}
                className="bg-[#2A2A2A] rounded-xl overflow-hidden hover:scale-105 transition-transform flex flex-col"
                data-animation="program-card"
              >
                <img
                  src={p.image}
                  alt={p.alt}
                  className="w-full h-48 object-cover opacity-80"
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="192"
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 300px"
                />
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-white uppercase">
                    {t(`about.programs.${p.id}.title`)}
                  </h3>
                  <p className="text-gray-400 text-sm lowercase mb-6 flex-grow">
                    {t(`about.programs.${p.id}.desc`)}
                  </p>
                  <Link to={`/programs/${p.id}`} className="mt-auto">
                    <Button
                      variant="white"
                      className="w-full !bg-white/10 !text-white hover:!bg-primary hover:!text-white transition-all text-xs uppercase tracking-widest py-2"
                    >
                      {t("common.view_more") || "View More"}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {visibleCount < PROGRAMS.length && (
            <div className="mt-12 flex justify-center">
              <Button
                onClick={handleLoadMore}
                variant="white"
                className="!bg-white !text-black hover:!bg-primary hover:!text-white transition-all px-10 py-3"
              >
                {t("common.load_more")}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-24 bg-white">
        <div className="max-w-none mx-auto px-[5%]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="bg-white p-10 rounded-2xl shadow-md hover:shadow-xl transition-all border-t-4 border-blood"
              data-animation="card"
            >
              <h3 className="text-2xl font-bold mb-4">
                {t("home.donations_made_title")}
              </h3>
              <p className="text-text-body mb-8">
                {t("home.donations_made_desc")}
              </p>
              <Link to="/donations-made">
                <Button variant="secondary" className="w-full">
                  {t("common.view_us")}
                </Button>
              </Link>
            </div>
            <div
              className="bg-white p-10 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100"
              data-animation="card"
            >
              <h3 className="text-2xl font-bold mb-4">
                {t("home.become_member_title")}
              </h3>
              <p className="text-text-body mb-8">
                {t("home.become_member_desc")}
              </p>
              <Link to="/volunteer">
                <Button variant="primary" className="w-full">
                  {t("volunteer.join_now")}
                </Button>
              </Link>
            </div>
            <div
              className="bg-white p-10 rounded-2xl shadow-md hover:shadow-xl transition-all border-t-4 border-primary"
              data-animation="card"
            >
              <h3 className="text-2xl font-bold mb-4">
                {t("home.wall_of_fame_title")}
              </h3>
              <p className="text-text-body mb-8">
                {t("home.wall_of_fame_desc")}
              </p>
              <Link to="/wall-of-fame">
                <Button variant="secondary" className="w-full">
                  {t("nav.wall_of_fame")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How You Can Help Section */}
      <section
        className="bg-secondary text-white py-24 overflow-hidden border-y border-border"
        data-animation="help-section"
      >
        <div className="max-w-none mx-auto px-[5%]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full -z-10"></div>
            <img
              src="https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_800/v1767814233/humanity_how_can_i_help_xezom5.avif"
              alt={IMAGE_ALTS.howCanIHelp}
              data-animation="help-image"
              className="rounded-2xl border border-white/20 w-full object-cover aspect-[3/2] shadow-2xl"
              width="800"
              height="533"
              loading="lazy"
              decoding="async"
            />
            <div className="relative lg:order-2"></div>
            <div className="space-y-6 lg:order-1" data-animation="help-text">
              <h2
                key={i18n.language}
                className="text-4xl md:text-5xl font-bold text-white"
              >
                {t("home.how_can_help_title")}
              </h2>
              <p className="text-lg text-white/90 leading-relaxed max-w-xl">
                {t("home.how_can_help_desc")}
              </p>
              <Link to="/volunteer">
                <Button
                  variant="white"
                  className="!bg-white !text-secondary hover:!bg-primary hover:!text-white transition-all"
                >
                  {t("nav.stay_connected")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section
        className="py-20 bg-white border-t border-gray-100"
        data-animation="newsletter-section"
      >
        <div className="max-w-none mx-auto px-[5%] text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t("home.join_the_movement")}
          </h2>
          <p className="text-gray-600 mb-8">{t("home.newsletter_desc")}</p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder={t("home.email_placeholder")}
              className="flex-1 px-6 py-3 rounded-md outline-none border focus:border-blood"
            />
            <Button>{t("home.subscribe")}</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
