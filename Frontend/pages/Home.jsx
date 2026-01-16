import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import hclogo from "../assets/humanitycallslogo.avif";
import { IMAGE_ALTS } from "../constants";
import {
  animateTitleIn,
  animateParagraphIn,
  animateCards,
} from "../utils/animations";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? 20 : 40;

    const ctx = gsap.context(() => {
      const heroTitle = document.querySelector('[data-animation="hero-title"]');
      const heroParagraph = document.querySelector(
        '[data-animation="hero-paragraph"]'
      );
      const heroImage = document.querySelector('[data-animation="hero-image"]');
      const heroGlow = document.querySelector('[data-animation="hero-glow"]');
      const heroButtons = document.querySelectorAll(
        '[data-animation="hero-button"]'
      );
      const bloodDonationSection = document.querySelector(
        '[data-animation="blood-section"]'
      );
      const bloodSectionImage = document.querySelector(
        '[data-animation="blood-image"]'
      );
      const statSection = document.querySelector(
        '[data-animation="stat-section"]'
      );
      const cards = document.querySelectorAll('[data-animation="card"]');
      const helpImage = document.querySelector('[data-animation="help-image"]');
      const helpText = document.querySelector('[data-animation="help-text"]');
      const newsletterSection = document.querySelector(
        '[data-animation="newsletter-section"]'
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
            }
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
            }
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
            }
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
          }
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
          }
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
          }
        );
      }

      if (cards.length > 0) {
        animateCards(cards);
      }

      if (helpImage) {
        gsap.set(helpImage, { willChange: "transform, opacity" });
        gsap.fromTo(
          helpImage,
          { opacity: 0, scale: 0.9, x: isMobile ? -20 : -40 },
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
          }
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
          }
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
          }
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
      <section className="relative min-h-[85vh] flex items-center bg-bg overflow-hidden">
        <div className="max-w-none mx-auto px-[5%] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 z-10">
            <h1
              key={i18n.language}
              className="text-5xl md:text-7xl font-bold text-primary leading-tight"
              data-animation="hero-title"
            >
              {t("home.hero_title_help")}{" "}
              <span className="text-secondary inline-flex items-center">
                {t("home.hero_title_humanity")}
                <span className="inline-block ml-2 animate-bounce">
                  <img src={hclogo} alt="logo" className="w-8 h-8 md:w-12 md:h-12" />
                </span>
              </span>
            </h1>
            <p
              className="text-xl text-text-body max-w-lg leading-relaxed"
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
                <Button variant="secondary" data-animation="hero-button">
                  {t("home.volunteer_with_us")}
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div
              className="absolute blur-3xl bg-primary/5 -z-10"
              style={{
                width: "400px",
                height: "400px",
                top: "-80px",
                left: "-80px",
              }}
              data-animation="hero-glow"
            ></div>
            <img
              src="https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_900/v1767814232/hc_landing_page_xrcmny.png"
              srcSet="
                https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_400/v1767814232/hc_landing_page_xrcmny.png 400w,
                https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_600/v1767814232/hc_landing_page_xrcmny.png 600w,
                https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_900/v1767814232/hc_landing_page_xrcmny.png 900w
              "
              sizes="(max-width: 640px) 90vw, 900px"
              alt={IMAGE_ALTS.hero}
              className="z-10 w-full object-cover aspect-[4/3.5] rounded-2xl"
              data-animation="hero-image"
              width="1000"
              height="875"
              fetchPriority="high"
            />
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
                <Button variant="white">{t("home.donate_today")}</Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full -z-10"></div>
              <img
                src="https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_800/v1767814232/hc_blood_donation_mfwveo.png"
                alt={IMAGE_ALTS.bloodDonation}
                data-animation="blood-image"
                className="rounded-2xl border border-white/20"
                width="800"
                height="533"
                loading="lazy"
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
      <section className="py-24 bg-white" data-animation="help-section">
        <div className="max-w-none mx-auto px-[5%] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_600/v1767814233/humanity_how_can_i_help_xezom5.avif"
              alt={IMAGE_ALTS.howCanIHelp}
              className="object-cover aspect-[4/5] w-full"
              data-animation="help-image"
              width="600"
              height="750"
              loading="lazy"
            />
          </div>
          <div className="space-y-16" data-animation="help-text">
            <h2
              key={i18n.language}
              className="text-4xl font-bold text-[#1A1A1A]"
            >
              {t("home.how_can_help_title")}
            </h2>
            <p className="text-lg text-[#4A4A4A] leading-relaxed">
              {t("home.how_can_help_desc")}
            </p>
            <Link to="/volunteer">
              <Button>{t("nav.stay_connected")}</Button>
            </Link>
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
