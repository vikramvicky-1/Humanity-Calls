import React, { useState, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { IMAGE_ALTS } from "../constants";
import { sendEmail } from "../utils/email";

gsap.registerPlugin(ScrollTrigger);

const AnimalRescue = () => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);

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
      "Animal Rescue Inquiry",
      formData,
      `New Animal Rescue Inquiry from ${formData.firstName}`
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
    <div className="bg-bg pb-24" ref={containerRef}>
      <SEO
        title={t("animal_rescue.seo_title")}
        description={t("animal_rescue.seo_desc")}
      />

      <section className="py-24 max-w-none mx-auto px-[5%] bg-white">
        <div className="flex flex-col items-center space-y-8">
          <img
            src="https://res.cloudinary.com/daokrum7i/image/upload/v1767814232/humanity_calls_animal_resque_dxz9jb.avif"
            alt={IMAGE_ALTS.animalRescue}
            className="rounded-2xl"
            data-animation="ar-image"
          />
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-primary" data-animation="ar-title">{t("animal_rescue.title")}</h1>
            <p className="text-lg text-text-body leading-relaxed" data-animation="ar-text">
              {t("animal_rescue.main_text")}
            </p>
            <div className="p-8 bg-bg rounded-2xl border-l-8 border-primary">
              <h2 className="text-2xl font-bold mb-2 text-primary">{t("animal_rescue.voice_title")}</h2>
              <p className="text-text-body/80">
                {t("animal_rescue.voice_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-none mx-auto px-[5%] mt-12">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-border shadow-xl" data-animation="ar-form">
          <h3 className="text-2xl font-bold mb-8 text-center text-primary">
            {t("animal_rescue.form_title")}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-body uppercase">
                  {t("poor_needy.first_name")}
                </label>
                <input
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-body uppercase">
                  {t("form.phone")}
                </label>
                <input
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  minLength={10}
                  maxLength={10}
                  className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-body uppercase">
                {t("form.email")}
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-body uppercase">
                {t("animal_rescue.address_label")}
              </label>
              <input
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-body uppercase">
                {t("animal_rescue.situation_details")}
              </label>
              <textarea
                required
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              ></textarea>
            </div>
            <Button type="submit" variant="primary" isLoading={loading} className="w-full py-4">
              {t("poor_needy.submit")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnimalRescue;
