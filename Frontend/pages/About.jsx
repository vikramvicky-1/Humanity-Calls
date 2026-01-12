import React, { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import { IMAGE_ALTS } from "../constants";
import { animateCards } from "../utils/animations";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? 15 : 30;
    
    const ctx = gsap.context(() => {
      const aboutTitle = document.querySelector('[data-animation="about-title"]');
      const aboutPara = document.querySelector('[data-animation="about-para"]');
      const missionSection = document.querySelector('[data-animation="mission-section"]');
      const missionImage = document.querySelector('[data-animation="mission-image"]');
      const visionSection = document.querySelector('[data-animation="vision-section"]');
      const visionImage = document.querySelector('[data-animation="vision-image"]');
      const programTitle = document.querySelector('[data-animation="program-title"]');
      const cards = document.querySelectorAll('[data-animation="program-card"]');
      const covidSection = document.querySelector('[data-animation="covid-section"]');

      if (aboutTitle) {
        gsap.fromTo(
          aboutTitle,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: aboutTitle,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (aboutPara) {
        gsap.fromTo(
          aboutPara,
          { opacity: 0, y: isMobile ? 10 : 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: aboutPara,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (missionSection) {
        gsap.fromTo(
          missionSection,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: missionSection,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (missionImage) {
        gsap.fromTo(
          missionImage,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: missionImage,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (visionSection) {
        gsap.fromTo(
          visionSection,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: visionSection,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (visionImage) {
        gsap.fromTo(
          visionImage,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: visionImage,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (programTitle) {
        gsap.fromTo(
          programTitle,
          { opacity: 0, y: isMobile ? 10 : 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: programTitle,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (cards.length > 0) {
        animateCards(cards);
      }

      if (covidSection) {
        gsap.fromTo(
          covidSection,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: covidSection,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [i18n.language]);

  const programs = [
    {
      id: "community_conservation",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767814231/hc_community_conservation_leov19.jpg",
      alt: "Community conservation project by Humanity Calls",
    },
    {
      id: "early_education",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767814231/hc_early_education_u8j2cv.jpg",
      alt: "Early education support for children",
    },
    {
      id: "forest_restoration",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767814231/hc_forest_restoration_jjjomq.jpg",
      alt: "Forest restoration initiative",
    },
    {
      id: "stop_wildlife_crime",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767814232/hc_stop_wildlife_crime_rxiaqf.jpg",
      alt: "Stopping wildlife crime initiative",
    },
    {
      id: "marine_conservation",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767814233/hc_marine_conservation_ptw4yg.webp",
      alt: "Marine conservation project",
    },
    {
      id: "environmental_policy",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767814231/hc_environmental_policy_gjhqyx.png",
      alt: "Environmental policy advocacy",
    },
  ];

  return (
    <div className="bg-white" ref={containerRef}>
      <SEO
        title={`${t("about.title")} | Humanity Calls`}
        description={t("about.programs_para")}
      />

      {/* About Section */}
      <section className="py-24 max-w-none mx-auto px-[5%]">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-16 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-blood-red" data-animation="about-title">{t("about.title")}</h1>
            <p className="text-lg text-gray-700 leading-relaxed lowercase" data-animation="about-para">
              {t("about.story_para")}
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-[#F5F5F5]">
        <div className="max-w-none mx-auto px-[5%]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-6" data-animation="mission-section">
              <h2 className="text-4xl font-bold text-blood-red">{t("about.mission_title")}</h2>
              <p className="text-lg text-gray-700 leading-relaxed lowercase">
                {t("about.mission_para")}
              </p>
            </div>
            <img
              src="https://res.cloudinary.com/daokrum7i/image/upload/v1767814233/humanity_calls_mission_xdaf3d.avif"
              alt={IMAGE_ALTS.mission}
              className="rounded-2xl shadow-xl order-1 lg:order-2"
              data-animation="mission-image"
            />
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-24 max-w-none mx-auto px-[5%]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <img
            src="https://res.cloudinary.com/daokrum7i/image/upload/v1767814233/humanity_calls_vision_i942bq.png"
            alt={IMAGE_ALTS.vision}
            className="rounded-2xl shadow-xl"
            data-animation="vision-image"
          />
          <div className="space-y-6" data-animation="vision-section">
            <h2 className="text-4xl font-bold text-blood-red">{t("about.vision_title")}</h2>
            <p className="text-lg text-gray-700 leading-relaxed lowercase">
              {t("about.vision_para")}
            </p>
          </div>
        </div>
      </section>

      {/* Programs & Projects */}
      <section className="py-24 bg-[#1A1A1A] text-white">
        <div className="max-w-none mx-auto px-[5%]">
          <div className="text-center mb-16" data-animation="program-title">
            <h2 className="text-4xl font-bold mb-6">{t("about.programs_title")}</h2>
            <p className="max-w-2xl mx-auto text-gray-400 lowercase">
              {t("about.programs_para")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((p, idx) => (
              <div
                key={idx}
                className="bg-[#2A2A2A] rounded-xl overflow-hidden hover:scale-105 transition-transform"
                data-animation="program-card"
              >
                <img
                  src={p.image}
                  alt={p.alt}
                  className="w-full h-48 object-cover opacity-80"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{t(`about.programs.${p.id}.title`)}</h3>
                  <p className="text-gray-400 text-sm lowercase">{t(`about.programs.${p.id}.desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COVID-19 Contributions */}
      <section className="py-24 max-w-none mx-auto px-[5%] text-center" data-animation="covid-section">
        <h2 className="text-3xl font-bold mb-8">
          {t("about.covid_title")}
        </h2>
        <div className="bg-blood-red/5 p-12 rounded-3xl border border-blood-red/10">
          <p className="text-xl text-gray-800 leading-relaxed italic lowercase">
            {t("about.covid_para")}
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
