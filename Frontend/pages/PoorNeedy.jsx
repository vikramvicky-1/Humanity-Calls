import React, { useState, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { IMAGE_ALTS } from "../constants";
import { sendEmail } from "../utils/email";

gsap.registerPlugin(ScrollTrigger);

const PoorNeedy = () => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? 15 : 30;
    
    const ctx = gsap.context(() => {
      const image = document.querySelector('[data-animation="pn-image"]');
      const title = document.querySelector('[data-animation="pn-title"]');
      const text = document.querySelector('[data-animation="pn-text"]');
      const form = document.querySelector('[data-animation="pn-form"]');

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
  }, [i18n.language]);
  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    email: "",
    address: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await sendEmail(
      "Poor & Needy Support Request",
      formData,
      `New Support Request from ${formData.firstName}`
    );

    if (success) {
      setFormData({
        firstName: "",
        phone: "",
        email: "",
        address: "",
        message: "",
      });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white pb-24" ref={containerRef}>
      <SEO
        title={`${t("poor_needy.seo_title")}`}
        description={t("poor_needy.seo_desc")}
      />

      <section className="py-24 max-w-none mx-auto px-[5%]">
        <div className="flex flex-col items-center space-y-8">
          <img
            src="https://res.cloudinary.com/daokrum7i/image/upload/v1767814233/humanity_calls_poor_needy_oef47s.avif"
            alt={IMAGE_ALTS.poorNeedy}
            className="rounded-2xl shadow-lg"
            data-animation="pn-image"
          />
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-blood-red" data-animation="pn-title">
              {t("poor_needy.title")}
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed" data-animation="pn-text">
              {t("poor_needy.main_text")}
            </p>
            <div className="p-8 bg-gray-50 rounded-2xl border-l-8 border-blood-red">
              <h2 className="text-2xl font-bold mb-2">{t("poor_needy.direct_impact_title")}</h2>
              <p className="text-gray-600">
                {t("poor_needy.direct_impact_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-none mx-auto px-[5%]">
        <div className="bg-[#F5F5F5] p-8 md:p-12 rounded-3xl border border-gray-200" data-animation="pn-form">
          <h3 className="text-2xl font-bold mb-8 text-center">
            {t("poor_needy.form_title")}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  {t("poor_needy.first_name")}
                </label>
                <input
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  {t("form.phone")}
                </label>
                <input
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  minLength={10}
                  maxLength={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase">
                {t("form.email")}
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase">
                {t("poor_needy.address_location")}
              </label>
              <input
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase">
                {t("poor_needy.requirement_details")}
              </label>
              <textarea
                required
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              ></textarea>
            </div>
            <Button type="submit" isLoading={loading} className="w-full py-4">
              {t("poor_needy.submit")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PoorNeedy;
