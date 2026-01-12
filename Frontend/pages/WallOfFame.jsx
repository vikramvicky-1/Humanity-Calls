import React, { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";

gsap.registerPlugin(ScrollTrigger);

const WallOfFame = () => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? 15 : 30;

    const ctx = gsap.context(() => {
      const heading = document.querySelector('[data-animation="wof-heading"]');
      const story = document.querySelector('[data-animation="wof-story"]');
      const team = document.querySelector('[data-animation="wof-team"]');
      const institutions = document.querySelectorAll(
        '[data-animation="wof-inst"]'
      );

      if (heading) {
        gsap.fromTo(
          heading,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: heading,
              start: "top 80%",
              once: true,
            },
          }
        );
      }

      if (story) {
        gsap.fromTo(
          story,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: story,
              start: "top 80%",
              once: true,
            },
          }
        );
      }

      if (team) {
        gsap.fromTo(
          team,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: team,
              start: "top 80%",
              once: true,
            },
          }
        );
      }

      if (institutions.length > 0) {
        institutions.forEach((inst, idx) => {
          gsap.fromTo(
            inst,
            { opacity: 0, scale: 0.9 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.6,
              delay: idx * 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: inst,
                start: "top 80%",
                once: true,
              },
            }
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [i18n.language]);
  const institutions = [
    {
      id: 1,
      altText: "BUC",
      logo: "https://res.cloudinary.com/daokrum7i/image/upload/v1767858723/hc_buc_in_cgo6ap.avif",
      link: "https://www.instagram.com/buc_india/",
    },
    {
      id: 2,
      altText: "Ufh Riders",
      logo: "https://res.cloudinary.com/daokrum7i/image/upload/v1767858721/hc_ufh_ohpyit.avif",
      link: "https://www.instagram.com/ufhriders/",
    },
    {
      id: 3,
      altText: "Cit",
      logo: "https://res.cloudinary.com/daokrum7i/image/upload/v1767858720/hc_cit_ben_urpobb.avif",
      link: "https://www.instagram.com/cit.bengaluru/",
    },
  ];

  const noLinkInstitutions = [
    {
      id: 1,
      altText: "SAG Events",
      logo: "https://res.cloudinary.com/daokrum7i/image/upload/v1767858720/hc_sag_events_tckhz4.avif",
    },
    {
      id: 1,
      altText: "Paramount public school",
      logo: "https://res.cloudinary.com/daokrum7i/image/upload/v1767858719/hc_pps_fmrkex.avif",
    },
  ];

  return (
    <div className="bg-[#F5F5F5] min-h-screen" ref={containerRef}>
      <SEO
        title={t("wall_of_fame.seo_title")}
        description={t("wall_of_fame.seo_desc")}
      />

      {/* Heading on Top */}
      <div
        className="pt-24 pb-12 text-center bg-white"
        data-animation="wof-heading"
      >
        <h1 className="text-5xl font-bold text-[#1A1A1A] mb-4">
          {t("wall_of_fame.title")}
        </h1>
        <p className="text-xl text-gray-600">
          {t("wall_of_fame.hero_subtitle")}
        </p>
      </div>

      {/* Full Width Banner with Link */}
      <div className="w-full">
        <a href="#">
          <img
            src="https://res.cloudinary.com/daokrum7i/image/upload/v1767858724/hc_wall_of_fame_qb8ckv.avif"
            alt="Wall of Fame Banner"
            className="w-full h-auto object-cover block"
          />
        </a>
      </div>

      <div className="max-w-none mx-auto px-[5%] py-20">
        {/* Our Story Section */}
        <div className="mb-24 text-center" data-animation="wof-story">
          <h2 className="text-4xl font-bold text-[#1A1A1A] mb-8">
            {t("wall_of_fame.story_title")}
          </h2>
          <div className="max-w-none mx-auto px-[5%] space-y-6">
            <p className="text-xl text-gray-700 leading-relaxed">
              {t("wall_of_fame.story_para1")}
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              {t("wall_of_fame.story_para2")}
            </p>
          </div>
        </div>

        {/* Meet The Team Section */}
        <div className="mb-16 text-center" data-animation="wof-team">
          <h2 className="text-4xl font-bold text-[#1A1A1A] mb-8">
            {t("wall_of_fame.team_title")}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed max-w-none mx-auto px-[5%]">
            {t("wall_of_fame.team_para")}
          </p>
        </div>

        {/* 5 Institutions Side by Side */}
        <div className="mb-24">
          <div className="flex justify-center items-center gap-2 max-w-none mx-auto px-[5%]">
            {institutions.map((inst) => (
              <a
                key={inst.id}
                href={inst.link}
                target="_blank"
                className="flex-1 aspect-square overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                data-animation="wof-inst"
              >
                <img
                  src={inst.logo}
                  alt={inst.altText}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
            {noLinkInstitutions.map((inst) => (
              <div
                key={inst.id}
                className="flex-1 aspect-square overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                data-animation="wof-inst"
              >
                <img
                  src={inst.logo}
                  alt={inst.altText}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <hr className="my-20 border-gray-200" />

        <div className="mt-20 text-center">
          <p className="text-gray-500 mb-8 italic">{t("wall_of_fame.quote")}</p>
          <div className="w-24 h-1 bg-blood-red mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default WallOfFame;
