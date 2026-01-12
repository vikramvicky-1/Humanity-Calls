import React, { useState, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { redirectToWhatsApp } from "../utils/whatsapp";

gsap.registerPlugin(ScrollTrigger);

const Volunteer = () => {
  const { t, i18n } = useTranslation();
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
  }, [i18n.language]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    interest: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `${t("volunteer.form_title")}:\n\n${t("volunteer.first_name")}: ${formData.firstName}\n${t("volunteer.last_name")}: ${formData.lastName}\n${t("volunteer.phone")}: ${formData.phone}\n${t("volunteer.email")}: ${formData.email}\n${t("volunteer.interest_area")}: ${formData.interest}`;
    redirectToWhatsApp(msg);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white min-h-screen py-24" ref={containerRef}>
      <SEO
        title={t("volunteer.seo_title")}
        description={t("volunteer.seo_desc")}
      />

      <div className="max-w-none mx-auto px-[5%] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div data-animation="vol-title">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-8">
            {t("volunteer.title")}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            {t("volunteer.description")}
          </p>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-blood-red">10+</h3>
              <p className="text-gray-500 font-medium">{t("volunteer.active_volunteers")}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F5F5F5] p-8 md:p-12 rounded-3xl border border-gray-200" data-animation="vol-form">
          <h3 className="text-2xl font-bold mb-8">{t("volunteer.form_title")}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                name="firstName"
                onChange={handleChange}
                placeholder={t("volunteer.first_name")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                required
                name="lastName"
                onChange={handleChange}
                placeholder={t("volunteer.last_name")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <input
              required
              type="email"
              name="email"
              onChange={handleChange}
              placeholder={t("volunteer.email")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              required
              type="tel"
              name="phone"
              onChange={handleChange}
              placeholder={t("volunteer.phone")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <select
              required
              name="interest"
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500"
            >
              <option value="">{t("volunteer.interest_area")}</option>
              <option value="Blood Donation">{t("volunteer.interests.blood")}</option>
              <option value="Poor/Needy Support">{t("volunteer.interests.needy")}</option>
              <option value="Animal Rescue">{t("volunteer.interests.animal")}</option>
              <option value="Event Organizing">{t("volunteer.interests.event")}</option>
            </select>
            <Button type="submit" className="w-full py-4">
              {t("volunteer.join_now")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Volunteer;
