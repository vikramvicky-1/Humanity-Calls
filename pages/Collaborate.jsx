import React, { useState, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { IMAGE_ALTS } from "../constants";
import { redirectToWhatsApp } from "../utils/whatsapp";

gsap.registerPlugin(ScrollTrigger);

const Collaborate = () => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? 15 : 30;
    
    const ctx = gsap.context(() => {
      const content = document.querySelector('[data-animation="collab-content"]');
      const form = document.querySelector('[data-animation="collab-form"]');

      if (content) {
        gsap.fromTo(
          content,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: content,
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
    institutionName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `Collaboration Request:\n\nInstitution: ${formData.institutionName}\nContact: ${formData.contactPerson}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nAddress: ${formData.address}\nMessage: ${formData.message}`;
    redirectToWhatsApp(msg);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white pb-24" ref={containerRef}>
      <SEO
        title="Collaborate with Humanity Calls | CSR & NGO Partnerships"
        description="Partner with Humanity Calls for CSR initiatives, blood donation drives, and community outreach. We collaborate with schools, colleges, and corporates."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-2" data-animation="collab-content">
            <h1 className="text-4xl font-bold text-blood-red">
              Collaborate With Us
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              We welcome partnerships with schools, colleges, and corporate
              companies. Our collaborative efforts include organizing massive
              blood donation camps, awareness seminars, and large-scale relief
              distributions. Together, we can multiply our impact.
            </p>
            <img
              src="https://res.cloudinary.com/daokrum7i/image/upload/v1767814232/hc_collaborate_llsbn4.png"
              alt={IMAGE_ALTS.collaborate}
            />
          </div>

          <div className="bg-[#F5F5F5] p-8 md:p-12 rounded-3xl border border-gray-200" data-animation="collab-form">
            <h3 className="text-2xl font-bold mb-8">Partnership Form</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  Institution Name
                </label>
                <input
                  required
                  name="institutionName"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  Contact Person Name
                </label>
                <input
                  required
                  name="contactPerson"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Address
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
                  Message / Proposal
                </label>
                <textarea
                  required
                  name="message"
                  onChange={handleChange}
                  rows={3}
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
    </div>
  );
};

export default Collaborate;
