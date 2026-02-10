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
        '[data-animation="wof-inst"]',
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
          },
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
          },
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
          },
        );
      }

      if (institutions.length > 0) {
        institutions.forEach((inst, idx) => {
          gsap.fromTo(
            inst,
            { opacity: 0, scale: 0.9, y: 20 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.6,
              delay: idx * 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: inst,
                start: "top 85%",
                once: true,
              },
            },
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [i18n.language]);

  const collaborators = [
    // New Logos

    {
      id: "n4",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1770734782/Bangalore_City_Police_Logo_pse9ph.png",
    },

    {
      id: "n6",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1770734782/Mane_Mane_ge_Police_szqjnh.png",
    },
    // Existing Logos
    {
      id: "e1",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767858723/hc_buc_in_cgo6ap.avif",
      link: "https://www.bucindia.com/",
    },
    {
      id: "e2",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767858721/hc_ufh_ohpyit.avif",
      link: "https://www.instagram.com/ufhriders/",
    },
    {
      id: "e3",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767858720/hc_cit_ben_urpobb.avif",
      link: "https://www.instagram.com/cit.bengaluru/",
    },
    {
      id: "e4",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767858720/hc_sag_events_tckhz4.avif",
    },
    {
      id: "n5",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1770734782/CortexFooter_mjusnb.png",
      link: "https://www.cortexit.in",
    },
    {
      id: "e5",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767858719/hc_pps_fmrkex.avif",
    },
    {
      id: "n1",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1770734780/gopalan_uktg5e.jpg",
    },
    {
      id: "n2",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1770734781/aims_pvvk8z.jpg",
    },
    {
      id: "n3",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1770734781/adisunkara_jldkkz.jpg",
    },
  ];

  return (
    <div className="bg-white min-h-screen" ref={containerRef}>
      <SEO
        title={t("wall_of_fame.seo_title")}
        description={t("wall_of_fame.seo_desc")}
      />

      {/* Heading on Top */}
      <div
        className="pt-24 pb-16 text-center bg-white"
        data-animation="wof-heading"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-6">
          {t("wall_of_fame.title")}
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto px-4">
          {t("wall_of_fame.hero_subtitle")}
        </p>
      </div>

      {/* Full Width Banner */}
      <div className="w-full">
        <img
          src="https://res.cloudinary.com/daokrum7i/image/upload/v1767858724/hc_wall_of_fame_qb8ckv.avif"
          alt="Wall of Fame Banner"
          className="w-full h-auto object-cover block"
        />
      </div>

      <div className="max-w-7xl mx-auto px-[5%] py-20">
        {/* Our Journey Section */}
        <div className="mb-24 text-center" data-animation="wof-story">
          <h2 className="text-4xl font-bold text-primary mb-8 relative inline-block">
            {t("wall_of_fame.story_title")}
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full"></span>
          </h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            <p className="text-xl text-gray-700 leading-relaxed">
              {t("wall_of_fame.story_para1")}
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              {t("wall_of_fame.story_para2")}
            </p>
          </div>
        </div>

        {/* Collaborators Grid */}
        <div className="mb-24">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="relative group flex flex-col items-center"
                data-animation="wof-inst"
              >
                {/* Improved Golden Frame Design */}
                <div className="relative p-[4px] rounded-xl overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                  {/* Metallic Gradient Border */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728] animate-shimmer"></div>

                  {/* Inner Content Area */}
                  <div className="relative bg-white rounded-[10px] p-4 md:p-6 aspect-square flex items-center justify-center overflow-hidden">
                    {collab.link ? (
                      <a
                        href={collab.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-full flex items-center justify-center"
                      >
                        <img
                          src={collab.image}
                          alt="Collaborator Logo"
                          className="max-w-full max-h-full object-contain group-hover:grayscale-0 transition-all duration-500"
                        />
                      </a>
                    ) : (
                      <img
                        src={collab.image}
                        alt="Collaborator Logo"
                        className="max-w-full max-h-full object-contain grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-20 border-gray-200" />

        <div className="mt-20 text-center">
          <p className="text-2xl text-gray-500 mb-8 italic font-serif">
            {t("wall_of_fame.quote")}
          </p>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full shadow-sm"></div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 4s linear infinite;
        }
      `,
        }}
      />
    </div>
  );
};

export default WallOfFame;
