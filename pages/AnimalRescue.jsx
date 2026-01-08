import React, { useState, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { IMAGE_ALTS } from "../constants";
import { redirectToWhatsApp } from "../utils/whatsapp";

gsap.registerPlugin(ScrollTrigger);

const AnimalRescue = () => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? 15 : 30;
    
    const ctx = gsap.context(() => {
      const image = document.querySelector('[data-animation="ar-image"]');
      const title = document.querySelector('[data-animation="ar-title"]');
      const text = document.querySelector('[data-animation="ar-text"]');
      const form = document.querySelector('[data-animation="ar-form"]');

      if (image) {
        gsap.fromTo(
          image,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: image,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (title) {
        gsap.fromTo(
          title,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: title,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (text) {
        gsap.fromTo(
          text,
          { opacity: 0, y: isMobile ? 10 : 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: text,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (form) {
        gsap.fromTo(
          form,
          { opacity: 0, y: isMobile ? 20 : 40, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: form,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);
  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    email: "",
    address: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `Animal Rescue Inquiry:\n\nName: ${formData.firstName}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nAddress: ${formData.address}\nMessage: ${formData.message}`;
    redirectToWhatsApp(msg);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white pb-24" ref={containerRef}>
      <SEO
        title="Animal Rescue | Help Stray Dogs & Animals | Humanity Calls"
        description="Our animal rescue team saves abandoned and injured stray animals. Contact us for rescue operations and help us find homes for voiceless companions."
      />

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8">
          <img
            src="https://res.cloudinary.com/daokrum7i/image/upload/v1767814232/humanity_calls_animal_resque_dxz9jb.avif"
            alt={IMAGE_ALTS.animalRescue}
            className="rounded-2xl shadow-xl"
            data-animation="ar-image"
          />
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-blood-red" data-animation="ar-title">Animal Rescue</h1>
            <p className="text-lg text-gray-700 leading-relaxed" data-animation="ar-text">
              An animal rescue group or animal rescue organization are dedicated
              to pet adoption. These groups take unwanted, abandoned, abused, or
              stray pets and attempt to find suitable homes for them. Many
              rescue groups are created by and run by volunteers, -Street -dogs
              who take animals into their homes and care for them — including
              training, playing, handling medical issues, and solving behavior
              problems — until a suitable permanent home can be found.
              organization is one that is dedicated to animal adoption. They
              take in -stray -lost -abandoned and surrendered animals. Most
              rescue groups are ran by volunteers that rely on donations for
              funding. Some rescue groups have an adoption facility, and others
              care for animals in their own homes.
            </p>
            <div className="p-8 bg-gray-50 rounded-2xl border-l-8 border-blood-red">
              <h2 className="text-2xl font-bold mb-2">Be a Voice</h2>
              <p className="text-gray-600">
                Help us protect our stray companions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-[#F5F5F5] p-8 md:p-12 rounded-3xl border border-gray-200" data-animation="ar-form">
          <h3 className="text-2xl font-bold mb-8 text-center">
            Rescue / Help Form
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  First Name
                </label>
                <input
                  required
                  name="firstName"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  Phone
                </label>
                <input
                  required
                  name="phone"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase">
                Email
              </label>
              <input
                required
                type="email"
                name="email"
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase">
                Address / Location of Animal
              </label>
              <input
                required
                name="address"
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase">
                Details about the situation
              </label>
              <textarea
                required
                name="message"
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              ></textarea>
            </div>
            <Button type="submit" className="w-full py-4">
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnimalRescue;
