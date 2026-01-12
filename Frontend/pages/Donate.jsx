import React, { useState, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { redirectToWhatsApp } from "../utils/whatsapp";

gsap.registerPlugin(ScrollTrigger);

const Donate = () => {
  const { t, i18n } = useTranslation();
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
  }, [i18n.language]);
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
    const message = `${t("donate.whatsapp_message_header")}\n\n${t("donate.details")}:\n${t("donate.full_name")}: ${formData.name}\n${t("donate.email_address")}: ${formData.email}\n${t("donate.phone_number")}: ${formData.phone}\n${t("donate.donation_amount")}: ${formData.amount}`;
    redirectToWhatsApp(message);
  };

  return (
    <div className="bg-white min-h-screen py-24" ref={containerRef}>
      <SEO
        title={t("donate.seo_title")}
        description={t("donate.seo_desc")}
      />

      <div className="max-w-none mx-auto px-[5%] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div data-animation="donate-title">
          <h1 className="text-5xl font-bold text-blood-red mb-8">{t("donate.title")}</h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            {t("donate.description")}
          </p>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h4 className="font-bold text-lg mb-2 text-gray-800">{t("donate.why_donate_title")}</h4>
            <ul className="text-gray-600 space-y-2">
              {t("donate.why_donate_list", { returnObjects: true }).map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-[#F5F5F5] p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm" data-animation="donate-form">
          <h3 className="text-2xl font-bold mb-8 text-gray-800">{t("donate.form_title")}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("donate.full_name")}</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("donate.placeholders.name")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-red focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("donate.email_address")}</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("donate.placeholders.email")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-red focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("donate.phone_number")}</label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t("donate.placeholders.phone")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-red focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("donate.donation_amount")}</label>
              <input
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder={t("donate.placeholders.amount")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-red focus:border-transparent outline-none transition-all"
              />
            </div>
            <Button type="submit" className="w-full py-4 text-lg font-semibold mt-4">
              {t("donate.submit_whatsapp")}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-4">
              {t("donate.whatsapp_note")}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Donate;
