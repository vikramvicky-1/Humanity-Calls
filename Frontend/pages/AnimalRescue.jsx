import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { IMAGE_ALTS } from "../constants";
import { sendEmail } from "../utils/email";
import withFormAuth from "../components/withFormAuth";
import axios from "axios";
import { toast } from "react-toastify";

gsap.registerPlugin(ScrollTrigger);

const AnimalRescue = ({
  user,
  isFieldDisabled,
  renderSubmitButton,
  loadPendingFormData,
  clearPendingFormData,
}) => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [activeForm, setActiveForm] = useState("rescue"); // rescue | adopt

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
            ease: "power2.out",
            scrollTrigger: {
              trigger: image,
              start: "top 80%",
              once: true,
            },
          },
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
            ease: "power2.out",
            scrollTrigger: {
              trigger: title,
              start: "top 80%",
              once: true,
            },
          },
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
            ease: "power2.out",
            scrollTrigger: {
              trigger: text,
              start: "top 80%",
              once: true,
            },
          },
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
            ease: "power2.out",
            scrollTrigger: {
              trigger: form,
              start: "top 80%",
              once: true,
            },
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [i18n.language]);

  const [rescueData, setRescueData] = useState(() => {
    const saved = loadPendingFormData();
    return (
      saved || {
        firstName: user?.name || "",
        phone: "",
        email: user?.email || "",
        address: "",
        message: "",
      }
    );
  });

  const [adoptData, setAdoptData] = useState(() => ({
    fullName: user?.name || "",
    phone: "",
    email: user?.email || "",
    city: "",
    homeType: "",
    experience: "",
    animalPreference: "",
    message: "",
  }));

  useEffect(() => {
    if (user) {
      setRescueData((prev) => ({ ...prev, firstName: user.name, email: user.email }));
      setAdoptData((prev) => ({ ...prev, fullName: user.name, email: user.email }));
    }
  }, [user]);

  const handleSubmitRescue = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${import.meta.env.VITE_API_URL}/form-submissions/animal_rescue_request`,
        rescueData,
        { headers, withCredentials: true },
      );

      await sendEmail(
        "Animal Rescue Request",
        rescueData,
        `New Animal Rescue Request from ${rescueData.firstName}`,
      );

      clearPendingFormData();
      setRescueData({
        firstName: user?.name || "",
        phone: "",
        email: user?.email || "",
        address: "",
        message: "",
      });
      toast.success("Rescue request submitted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit rescue request");
    } finally {
      setLoading(false);
    }
  };

  const handleRescueChange = (e) => {
    setRescueData({ ...rescueData, [e.target.name]: e.target.value });
  };

  const handleAdoptChange = (e) => {
    setAdoptData({ ...adoptData, [e.target.name]: e.target.value });
  };

  const handleSubmitAdopt = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${import.meta.env.VITE_API_URL}/form-submissions/animal_adopt_now`,
        adoptData,
        { headers, withCredentials: true },
      );

      await sendEmail(
        "Adopt Now Request",
        adoptData,
        `New Adoption Request from ${adoptData.fullName}`,
      );

      setAdoptData({
        fullName: user?.name || "",
        phone: "",
        email: user?.email || "",
        city: "",
        homeType: "",
        experience: "",
        animalPreference: "",
        message: "",
      });
      toast.success("Adoption request submitted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit adoption request");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 border border-border bg-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed";

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h3 className="text-2xl font-bold text-primary">
              Animal Rescue Forms
            </h3>
            <div className="flex items-center gap-2 bg-bg p-1.5 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setActiveForm("rescue")}
                className={`px-4 py-2 rounded-xl font-bold transition-all text-sm ${
                  activeForm === "rescue"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-body/60 hover:text-primary hover:bg-white"
                }`}
              >
                Ask for Rescue
              </button>
              <button
                type="button"
                onClick={() => setActiveForm("adopt")}
                className={`px-4 py-2 rounded-xl font-bold transition-all text-sm ${
                  activeForm === "adopt"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-body/60 hover:text-primary hover:bg-white"
                }`}
              >
                Adopt Now
              </button>
            </div>
          </div>

          {activeForm === "rescue" ? (
            <form onSubmit={handleSubmitRescue} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-body uppercase">
                    Your Name *
                  </label>
                  <input
                    required
                    name="firstName"
                    value={rescueData.firstName}
                    onChange={handleRescueChange}
                    className={inputClasses}
                    disabled={isFieldDisabled("firstName")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-body uppercase">
                    {t("form.phone")} *
                  </label>
                  <input
                    required
                    name="phone"
                    value={rescueData.phone}
                    onChange={handleRescueChange}
                    minLength={10}
                    maxLength={10}
                    className={inputClasses}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-body uppercase">
                  {t("form.email")} *
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={rescueData.email}
                  onChange={handleRescueChange}
                  className={inputClasses}
                  disabled={isFieldDisabled("email")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-body uppercase">
                  Location / Address *
                </label>
                <input
                  required
                  name="address"
                  value={rescueData.address}
                  onChange={handleRescueChange}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-body uppercase">
                  Situation Details *
                </label>
                <textarea
                  required
                  name="message"
                  value={rescueData.message}
                  onChange={handleRescueChange}
                  rows={4}
                  className={inputClasses}
                ></textarea>
              </div>
              {renderSubmitButton(
                <Button type="submit" variant="primary" isLoading={loading} className="w-full py-4">
                  Submit Rescue Request
                </Button>,
                rescueData,
              )}
            </form>
          ) : (
            <form onSubmit={handleSubmitAdopt} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-body uppercase">
                    Full Name *
                  </label>
                  <input
                    required
                    name="fullName"
                    value={adoptData.fullName}
                    onChange={handleAdoptChange}
                    className={inputClasses}
                    disabled={isFieldDisabled("fullName")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-body uppercase">
                    {t("form.phone")} *
                  </label>
                  <input
                    required
                    name="phone"
                    value={adoptData.phone}
                    onChange={handleAdoptChange}
                    minLength={10}
                    maxLength={10}
                    className={inputClasses}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-body uppercase">
                  {t("form.email")} *
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={adoptData.email}
                  onChange={handleAdoptChange}
                  className={inputClasses}
                  disabled={isFieldDisabled("email")}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-body uppercase">City *</label>
                  <input
                    required
                    name="city"
                    value={adoptData.city}
                    onChange={handleAdoptChange}
                    placeholder="Your city"
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-body uppercase">Home Type *</label>
                  <select
                    required
                    name="homeType"
                    value={adoptData.homeType}
                    onChange={handleAdoptChange}
                    className={inputClasses}
                  >
                    <option value="">Select</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Farm / Outdoor Space">Farm / Outdoor Space</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-body uppercase">Experience *</label>
                  <select
                    required
                    name="experience"
                    value={adoptData.experience}
                    onChange={handleAdoptChange}
                    className={inputClasses}
                  >
                    <option value="">Select</option>
                    <option value="First time">First time</option>
                    <option value="Have adopted before">Have adopted before</option>
                    <option value="Currently have pets">Currently have pets</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-body uppercase">Animal Preference *</label>
                  <select
                    required
                    name="animalPreference"
                    value={adoptData.animalPreference}
                    onChange={handleAdoptChange}
                    className={inputClasses}
                  >
                    <option value="">Select</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Any">Any</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-body uppercase">Message *</label>
                <textarea
                  required
                  name="message"
                  value={adoptData.message}
                  onChange={handleAdoptChange}
                  rows={4}
                  placeholder="Why do you want to adopt? Any details we should know?"
                  className={inputClasses}
                />
              </div>
              {renderSubmitButton(
                <Button type="submit" variant="primary" isLoading={loading} className="w-full py-4">
                  Submit Adoption Request
                </Button>,
                adoptData,
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default withFormAuth(AnimalRescue);
