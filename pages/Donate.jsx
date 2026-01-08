import React, { useState, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { redirectToWhatsApp } from "../utils/whatsapp";

gsap.registerPlugin(ScrollTrigger);

const Donate = () => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? 15 : 30;
    
    const ctx = gsap.context(() => {
      const title = document.querySelector('[data-animation="donate-title"]');
      const form = document.querySelector('[data-animation="donate-form"]');

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
    name: "",
    email: "",
    phone: "",
    amount: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `I would like to donate.\n\nDetails:\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nAmount: ${formData.amount}`;
    redirectToWhatsApp(message);
  };

  return (
    <div className="bg-white min-h-screen py-24" ref={containerRef}>
      <SEO
        title="Donate Now | Support Humanity Calls NGO"
        description="Your contribution helps us save lives, rescue animals, and support those in need. Donate today to Humanity Calls NGO."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div data-animation="donate-title">
          <h1 className="text-5xl font-bold text-blood-red mb-8">Donate Now</h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            Your generosity can make a real difference. Every donation goes
            directly towards our mission of saving lives through blood donation
            drives, animal rescue, and helping the underprivileged.
          </p>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h4 className="font-bold text-lg mb-2 text-gray-800">Why Donate?</h4>
            <ul className="text-gray-600 space-y-2">
              <li>• Support emergency blood donation drives</li>
              <li>• Provide medical care for rescued animals</li>
              <li>• Help underprivileged families with essentials</li>
              <li>• Facilitate community conservation programs</li>
            </ul>
          </div>
        </div>

        <div className="bg-[#F5F5F5] p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm" data-animation="donate-form">
          <h3 className="text-2xl font-bold mb-8 text-gray-800">Donor Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-red focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-red focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 1234567890"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-red focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Donation Amount (Optional)</label>
              <input
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-red focus:border-transparent outline-none transition-all"
              />
            </div>
            <Button type="submit" className="w-full py-4 text-lg font-semibold mt-4">
              Donate via WhatsApp
            </Button>
            <p className="text-xs text-gray-500 text-center mt-4">
              Clicking the button will open WhatsApp with your message.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Donate;
