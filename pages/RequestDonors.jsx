import React, { useState, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { IMAGE_ALTS } from "../constants";
import { redirectToWhatsApp } from "../utils/whatsapp";

gsap.registerPlugin(ScrollTrigger);

const RequestDonors = () => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? 15 : 30;
    
    const ctx = gsap.context(() => {
      const title = document.querySelector('[data-animation="req-title"]');
      const form = document.querySelector('[data-animation="req-form"]');

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
    verifiedPersonName: "",
    phone: "",
    email: "",
    patientName: "",
    bloodGroup: "",
    hospitalAddressWithPincode: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `Blood Donor Request:\n\nVerified Person: ${formData.verifiedPersonName}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nPatient: ${formData.patientName}\nGroup: ${formData.bloodGroup}\nHospital Address & Pincode: ${formData.hospitalAddressWithPincode}`;
    redirectToWhatsApp(msg);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen" ref={containerRef}>
      <SEO
        title="Request Blood Donors"
        description="Submit a request for emergency blood donation. Our network of donors is here to help."
      />

      <div className="w-full relative h-[400px] md:h-[600px] mb-12">
        <img
          src="https://res.cloudinary.com/daokrum7i/image/upload/v1767814234/request_for_donors_digyme.avif"
          alt={IMAGE_ALTS.bloodDonation}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center" data-animation="req-title">
          <h1 className="text-4xl md:text-7xl font-black text-white text-center px-4 tracking-tighter">
            HAVE A REQUIREMENT FOR{" "}
            <span className="text-blood-red">BLOOD?</span>{" "}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-24">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100" data-animation="req-form">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
              Request For Donors
            </h2>
            <p className="text-gray-500">
              Fill in the emergency details below to notify our donor network.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                  Verified Person Name
                </label>
                <input
                  required
                  name="verifiedPersonName"
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blood-red outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                  Phone
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blood-red outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                Email
              </label>
              <input
                required
                type="email"
                name="email"
                onChange={handleChange}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blood-red outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                  Patient Name
                </label>
                <input
                  required
                  name="patientName"
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blood-red outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                  Blood Group Required
                </label>
                <select
                  required
                  name="bloodGroup"
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blood-red outline-none transition-all"
                >
                  <option value="">Select Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                Hospital Address with Pincode
              </label>
              <textarea
                required
                name="hospitalAddressWithPincode"
                onChange={handleChange}
                rows="3"
                placeholder="Full address including pincode"
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blood-red outline-none transition-all"
              ></textarea>
            </div>

            <Button
              type="submit"
              className="w-full py-5 text-lg shadow-lg shadow-blood-red/20"
            >
              Submit Emergency Request
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestDonors;
