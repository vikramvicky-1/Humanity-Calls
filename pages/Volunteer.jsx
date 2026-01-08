import React, { useState, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { redirectToWhatsApp } from "../utils/whatsapp";

gsap.registerPlugin(ScrollTrigger);

const Volunteer = () => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? 15 : 30;
    
    const ctx = gsap.context(() => {
      const title = document.querySelector('[data-animation="vol-title"]');
      const form = document.querySelector('[data-animation="vol-form"]');

      if (title) {
        gsap.fromTo(
          title,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: title,
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
    lastName: "",
    email: "",
    phone: "",
    interest: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `Volunteer Application:\n\nName: ${formData.firstName} ${formData.lastName}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nInterest: ${formData.interest}`;
    redirectToWhatsApp(msg);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white min-h-screen py-24" ref={containerRef}>
      <SEO
        title="Volunteer with Humanity Calls | Join Our NGO"
        description="Join our mission to serve humanity. Become a volunteer at Humanity Calls and help us with blood donation, animal rescue, and supporting the needy."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div data-animation="vol-title">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-8">
            Join the Movement
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            Volunteers are the backbone of Humanity Calls. Whether you can
            donate blood, help with logistics, or assist in animal rescue, your
            contribution matters.
          </p>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-blood-red">10+</h3>
              <p className="text-gray-500 font-medium">Active Volunteers</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F5F5F5] p-8 md:p-12 rounded-3xl border border-gray-200" data-animation="vol-form">
          <h3 className="text-2xl font-bold mb-8">Volunteer Application</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                name="firstName"
                onChange={handleChange}
                placeholder="First Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                required
                name="lastName"
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <input
              required
              type="email"
              name="email"
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              required
              type="tel"
              name="phone"
              onChange={handleChange}
              placeholder="Phone"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <select
              required
              name="interest"
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500"
            >
              <option value="">Area of Interest</option>
              <option value="Blood Donation">Blood Donation</option>
              <option value="Poor/Needy Support">Poor/Needy Support</option>
              <option value="Animal Rescue">Animal Rescue</option>
              <option value="Event Organizing">Event Organizing</option>
            </select>
            <Button type="submit" className="w-full py-4">
              Join Now
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Volunteer;
