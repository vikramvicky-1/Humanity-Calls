import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import { IMAGE_ALTS } from "../constants";
import { animateCards } from "../utils/animations";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
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
  }, []);
  const programs = [
    {
      title: "Community Conservation",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767814231/hc_community_conservation_leov19.jpg",
      description: "Empowering locals to protect their environment.",
      alt: "Community conservation project by Humanity Calls",
    },
    {
      title: "Early Education",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767814231/hc_early_education_u8j2cv.jpg",
      description: "Providing tools for children to build their futures.",
      alt: "Early education support for children",
    },
    {
      title: "Forest Restoration",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767814231/hc_forest_restoration_jjjomq.jpg",
      description: "Healing the earth one sapling at a time.",
      alt: "Forest restoration initiative",
    },
    {
      title: "Stop Wildlife Crime",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767814232/hc_stop_wildlife_crime_rxiaqf.jpg",
      description: "Vigilance and protection for our wildlife.",
      alt: "Stopping wildlife crime initiative",
    },
    {
      title: "Marine Conservation",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767814233/hc_marine_conservation_ptw4yg.webp",
      description: "Keeping our oceans clean and teeming with life.",
      alt: "Marine conservation project",
    },
    {
      title: "Environmental Policy",
      image:
        "https://res.cloudinary.com/daokrum7i/image/upload/v1767814231/hc_environmental_policy_gjhqyx.png",
      description: "Advocating for sustainable governance.",
      alt: "Environmental policy advocacy",
    },
  ];

  return (
    <div className="bg-white" ref={containerRef}>
      <SEO
        title="About Us | Our Mission to Serve Humanity"
        description="Discover the story behind Humanity Calls. Our mission is to provide emergency blood support, help the underprivileged, and protect nature and animals."
      />

      {/* The Full Story */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-16 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-blood-red" data-animation="about-title">About Us</h1>
            <p className="text-lg text-gray-700 leading-relaxed lowercase" data-animation="about-para">
              we humanity calls mainly focus on fulfilling the requirement of
              blood in emergency condition.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-6" data-animation="mission-section">
              <h2 className="text-4xl font-bold text-blood-red">Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed lowercase">
                we @humanity calls working for the society with social
                responsibility to help every person, who have medical
                emergencies and assistance in all the time and in all the places
                to provide our services through people.
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
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <img
            src="https://res.cloudinary.com/daokrum7i/image/upload/v1767814233/humanity_calls_vision_i942bq.png"
            alt={IMAGE_ALTS.vision}
            className="rounded-2xl shadow-xl"
            data-animation="vision-image"
          />
          <div className="space-y-6" data-animation="vision-section">
            <h2 className="text-4xl font-bold text-blood-red">Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed lowercase">
              humanity calls looking forward to help in various ways like
              hospitalizations, poor/needy, education, animal rescue, animal
              shelter and even our humanity calls into nature protections to
              bring a positive changes in entire nation with humanity. ​
            </p>
          </div>
        </div>
      </section>

      {/* Programs & Projects */}
      <section className="py-24 bg-[#1A1A1A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-animation="program-title">
            <h2 className="text-4xl font-bold mb-6">PROGRAMS & PROJECTS</h2>
            <p className="max-w-2xl mx-auto text-gray-400 lowercase">
              humanity calls extends its reach beyond emergency blood support
              into several core areas of social impact.
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
                  <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                  <p className="text-gray-400 text-sm lowercase">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COVID-19 Contributions */}
      <section className="py-24 max-w-5xl mx-auto px-4 text-center" data-animation="covid-section">
        <h2 className="text-3xl font-bold mb-8">
          OUR CONTRIBUTIONS DURING COVID-19
        </h2>
        <div className="bg-blood-red/5 p-12 rounded-3xl border border-blood-red/10">
          <p className="text-xl text-gray-800 leading-relaxed italic lowercase">
            "during the height of the pandemic, our volunteers were on the front
            lines, facilitating oxygen supply, distributing over 5000 meal
            packets daily, and providing medical support to families in
            isolation. humanity truly calls when the times are toughest."
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
