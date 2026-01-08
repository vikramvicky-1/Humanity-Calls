import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { IMAGE_ALTS } from "../constants";
import {
  animateTitleIn,
  animateParagraphIn,
  animateCards,
} from "../utils/animations";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
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
        gsap.fromTo(
          heroImage,
          { opacity: 0, scale: 0.8, x: isMobile ? 30 : 100, rotate: 5 },
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
  }, []);

  return (
    <div ref={containerRef}>
      <SEO
        title="Humanity Calls | NGO for Blood Donation & Animal Rescue"
        description="Join Humanity Calls. We provide emergency blood donor support, help the needy, and conduct animal rescue operations. Volunteer today to make a difference."
      />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 z-10">
            <h1
              className="text-5xl md:text-7xl font-bold text-[#1A1A1A] leading-tight"
              data-animation="hero-title"
            >
              Help{" "}
              <span className="text-blood-red inline-flex items-center">
                Humanity
                <span className="inline-block ml-2 drop-shadow-md animate-bounce">
                  <svg
                    className="w-8 h-8 md:w-12 md:h-12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 0C12 0 6 13 6 18.5C6 21.54 8.69 24 12 24C15.31 24 18 21.54 18 18.5C18 13 12 0 12 0Z" />
                  </svg>
                </span>
              </span>
            </h1>
            <p
              className="text-xl text-[#4A4A4A] max-w-lg leading-relaxed"
              data-animation="hero-paragraph"
            >
              Serving those in need through emergency blood support, uplifting
              the underprivileged, and protecting our animal companions
              nationwide.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/collaborate">
                <Button data-animation="hero-button">
                  Collaborate With Us
                </Button>
              </Link>
              <Link to="/volunteer">
                <Button variant="outline" data-animation="hero-button">
                  Volunteer With Us
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div
              className="absolute blur-3xl bg-blood-red/5 -z-10"
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
              alt={IMAGE_ALTS.hero}
              className="z-10 w-full object-cover aspect-[4/3.5]"
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
        className="bg-blood-red text-white py-24 overflow-hidden"
        data-animation="blood-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Donate Blood, Save Lives
              </h2>
              <p className="text-lg text-white/90 leading-relaxed">
                Blood is essential to help patients survive surgeries, cancer
                treatment, chronic illnesses, and traumatic injuries. This
                lifesaving care starts with one person making a generous
                donation. The need for blood is constant.
              </p>
              <Link to="/donate">
                <Button variant="white">Donate Today</Button>
              </Link>
            </div>
            <div className="">
              <img
                src="https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_800/v1767814232/hc_blood_donation_mfwveo.png"
                alt={IMAGE_ALTS.bloodDonation}
                data-animation="blood-image"
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
        className="bg-white py-20 border-b"
        data-animation="stat-section"
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-3xl md:text-4xl font-bold text-[#4A4A4A]">
            <span className="text-blood-red">1000+</span> donors and{" "}
            <span className="text-blood-red">1</span> purpose !
          </p>
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-24 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all border-t-4 border-blood-red"
              data-animation="card"
            >
              <h3 className="text-2xl font-bold mb-4">Donations Made</h3>
              <p className="text-[#9E9E9E] mb-8">
                Here is our precious donors who came forward to donate their
                blood save so many lives with unconditional timings and
                situations.
              </p>
              <Link to="/donations-made">
                <Button variant="secondary" className="w-full">
                  View Us
                </Button>
              </Link>
            </div>
            <div
              className="bg-[#E0E0E0] p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all"
              data-animation="card"
            >
              <h3 className="text-2xl font-bold mb-4">Become a Member</h3>
              <p className="text-[#4A4A4A] mb-8">
                Become a member of our organization @Humanity Calls and find
                people near you who have a requirement for blood...
              </p>
              <Link to="/volunteer">
                <Button variant="primary" className="w-full">
                  Join Now
                </Button>
              </Link>
            </div>
            <div
              className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all border-t-4 border-gray-400"
              data-animation="card"
            >
              <h3 className="text-2xl font-bold mb-4">Our Wall of Fame</h3>
              <p className="text-[#9E9E9E] mb-8">
                Our wall of fame shows all the donations made @Humanity Calls
                possible by us and our team.
              </p>
              <Link to="/wall-of-fame">
                <Button variant="secondary" className="w-full">
                  Wall of Fame
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How You Can Help Section */}
      <section className="py-24 bg-white" data-animation="help-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_600/v1767814233/humanity_how_can_i_help_xezom5.avif"
              alt={IMAGE_ALTS.howCanIHelp}
              className="object-fit aspect-[3/3]"
              data-animation="help-image"
              width="600"
              height="600"
              loading="lazy"
            />
          </div>
          <div className="space-y-16" data-animation="help-text">
            <h2 className="text-4xl font-bold text-[#1A1A1A]">
              HOW CAN YOU HELP?
            </h2>
            <p className="text-lg text-[#4A4A4A] leading-relaxed">
              We @Humanity calls look forward to donors for patients from time
              to time. We will be posting requirements on our donor-requirement
              page. Become a member of our organization and join hands with us
              today!
            </p>
            <Link to="/volunteer">
              <Button>Join Us</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section
        className="py-20 bg-gray-100"
        data-animation="newsletter-section"
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">JOIN THE MOVEMENT!</h2>
          <p className="text-gray-600 mb-8">
            Get the Latest News & Updates directly in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your Email Address"
              className="flex-1 px-6 py-3 rounded-md outline-none border focus:border-blood-red"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
