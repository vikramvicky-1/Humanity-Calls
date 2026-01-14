import React, { useState, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { IMAGE_ALTS } from "../constants";
import { sendEmail } from "../utils/email";

gsap.registerPlugin(ScrollTrigger);

const RequestDonors = () => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);

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
  }, [i18n.language]);
  const [formData, setFormData] = useState({
    verifiedPersonName: "",
    phone: "",
    email: "",
    patientName: "",
    bloodGroup: "",
    hospitalAddressWithPincode: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await sendEmail(
      "Donor Request",
      formData,
      `New Blood Donor Request for ${formData.patientName}`
    );

    if (success) {
      setFormData({
        verifiedPersonName: "",
        phone: "",
        email: "",
        patientName: "",
        bloodGroup: "",
        hospitalAddressWithPincode: "",
      });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen" ref={containerRef}>
      <SEO
        title={`${t("request_donors.title")} | Humanity Calls`}
        description={t("request_donors.seo_desc")}
      />

      <div className="w-full relative h-[400px] md:h-[600px] mb-12">
        <img
          src="https://res.cloudinary.com/daokrum7i/image/upload/v1767814234/request_for_donors_digyme.avif"
          alt={IMAGE_ALTS.bloodDonation}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center" data-animation="req-title">
          <h1 className="text-4xl md:text-7xl font-black text-white text-center px-4 tracking-tighter">
            {t("request_donors.hero_title_part1")}{" "}
            <span className="text-blood-red">{t("request_donors.hero_title_part2")}</span>{" "}
          </h1>
        </div>
      </div>

      <div className="max-w-none mx-auto px-[5%] pb-24">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100" data-animation="req-form">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
              {t("request_donors.form_title")}
            </h2>
            <p className="text-gray-500">
              {t("request_donors.form_subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                  {t("request_donors.verified_person")}
                </label>
                <input
                  required
                  name="verifiedPersonName"
                  value={formData.verifiedPersonName}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blood-red outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                  {t("form.phone")}
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  minLength={10}
                  maxLength={10}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blood-red outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                {t("form.email")}
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blood-red outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                  {t("request_donors.patient_name")}
                </label>
                <input
                  required
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blood-red outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                  {t("request_donors.blood_group")}
                </label>
                <select
                  required
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blood-red outline-none transition-all"
                >
                  <option value="">{t("request_donors.select_group")}</option>
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
                {t("request_donors.hospital_address")}
              </label>
              <textarea
                required
                name="hospitalAddressWithPincode"
                value={formData.hospitalAddressWithPincode}
                onChange={handleChange}
                rows="3"
                placeholder={t("request_donors.hospital_address_placeholder")}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blood-red outline-none transition-all"
              ></textarea>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-5 text-lg shadow-lg shadow-blood-red/20"
            >
              {t("request_donors.submit_request")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestDonors;
