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

const PoorNeedy = ({
  user,
  isFieldDisabled,
  renderSubmitButton,
  loadPendingFormData,
  clearPendingFormData,
}) => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [activeForm, setActiveForm] = useState("request_help"); // request_help | help_now

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

  const [requestHelpData, setRequestHelpData] = useState(() => {
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

  const [helpNowData, setHelpNowData] = useState(() => ({
    fullName: user?.name || "",
    phone: "",
    email: user?.email || "",
    location: "",
    supportType: "",
    details: "",
  }));

  useEffect(() => {
    if (user) {
      setRequestHelpData((prev) => ({ ...prev, firstName: user.name, email: user.email }));
      setHelpNowData((prev) => ({ ...prev, fullName: user.name, email: user.email }));
    }
  }, [user]);

  const handleSubmitRequestHelp = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${import.meta.env.VITE_API_URL}/form-submissions/poor_request_help`,
        requestHelpData,
        { headers, withCredentials: true },
      );

      await sendEmail(
        "Poor & Needy Support Request",
        requestHelpData,
        `New Support Request from ${requestHelpData.firstName}`,
      );

      clearPendingFormData();
      setRequestHelpData({
        firstName: user?.name || "",
        phone: "",
        email: user?.email || "",
        address: "",
        message: "",
      });
      toast.success("Request submitted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestHelpChange = (e) => {
    setRequestHelpData({ ...requestHelpData, [e.target.name]: e.target.value });
  };

  const handleHelpNowChange = (e) => {
    setHelpNowData({ ...helpNowData, [e.target.name]: e.target.value });
  };

  const handleSubmitHelpNow = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${import.meta.env.VITE_API_URL}/form-submissions/poor_help_now`,
        helpNowData,
        { headers, withCredentials: true },
      );

      await sendEmail(
        "Poor & Needy - Help Now",
        helpNowData,
        `New Help Now Offer from ${helpNowData.fullName}`,
      );

      setHelpNowData({
        fullName: user?.name || "",
        phone: "",
        email: user?.email || "",
        location: "",
        supportType: "",
        details: "",
      });
      toast.success("Offer submitted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-4xl font-bold text-primary" data-animation="pn-title">
              {t("poor_needy.title")}
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed" data-animation="pn-text">
              {t("poor_needy.main_text")}
            </p>
            <div className="p-8 bg-white rounded-2xl border-l-8 border-primary shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-2 text-primary">{t("poor_needy.direct_impact_title")}</h2>
              <p className="text-gray-600">
                {t("poor_needy.direct_impact_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-none mx-auto px-[5%]">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-border shadow-xl" data-animation="pn-form">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h3 className="text-2xl font-bold text-primary">
              Poor & Needy Forms
            </h3>
            <div className="flex items-center gap-2 bg-bg p-1.5 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setActiveForm("request_help")}
                className={`px-4 py-2 rounded-xl font-bold transition-all text-sm ${
                  activeForm === "request_help"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-body/60 hover:text-primary hover:bg-white"
                }`}
              >
                Request for Help
              </button>
              <button
                type="button"
                onClick={() => setActiveForm("help_now")}
                className={`px-4 py-2 rounded-xl font-bold transition-all text-sm ${
                  activeForm === "help_now"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-body/60 hover:text-primary hover:bg-white"
                }`}
              >
                Help Now
              </button>
            </div>
          </div>

          {activeForm === "request_help" ? (
            <form onSubmit={handleSubmitRequestHelp} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">
                    {t("poor_needy.first_name")}
                  </label>
                  <input
                    required
                    name="firstName"
                    value={requestHelpData.firstName}
                    onChange={handleRequestHelpChange}
                    className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isFieldDisabled("firstName")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">
                    {t("form.phone")}
                  </label>
                  <input
                    required
                    name="phone"
                    value={requestHelpData.phone}
                    onChange={handleRequestHelpChange}
                    minLength={10}
                    maxLength={10}
                    className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
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
                  value={requestHelpData.email}
                  onChange={handleRequestHelpChange}
                  className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isFieldDisabled("email")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  {t("poor_needy.address_location")}
                </label>
                <input
                  required
                  name="address"
                  value={requestHelpData.address}
                  onChange={handleRequestHelpChange}
                  className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  {t("poor_needy.requirement_details")}
                </label>
                <textarea
                  required
                  name="message"
                  value={requestHelpData.message}
                  onChange={handleRequestHelpChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                ></textarea>
              </div>
              {renderSubmitButton(
                <Button type="submit" isLoading={loading} className="w-full py-4">
                  {t("poor_needy.submit")}
                </Button>,
                requestHelpData,
              )}
            </form>
          ) : (
            <form onSubmit={handleSubmitHelpNow} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">
                    Your Name *
                  </label>
                  <input
                    required
                    name="fullName"
                    value={helpNowData.fullName}
                    onChange={handleHelpNowChange}
                    className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isFieldDisabled("fullName")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">
                    {t("form.phone")} *
                  </label>
                  <input
                    required
                    name="phone"
                    value={helpNowData.phone}
                    onChange={handleHelpNowChange}
                    minLength={10}
                    maxLength={10}
                    className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  {t("form.email")} *
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={helpNowData.email}
                  onChange={handleHelpNowChange}
                  className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isFieldDisabled("email")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  Location *
                </label>
                <input
                  required
                  name="location"
                  value={helpNowData.location}
                  onChange={handleHelpNowChange}
                  placeholder="City / area"
                  className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  How can you help? *
                </label>
                <select
                  required
                  name="supportType"
                  value={helpNowData.supportType}
                  onChange={handleHelpNowChange}
                  className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                >
                  <option value="">Select</option>
                  <option value="Food / Groceries">Food / Groceries</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Education Support">Education Support</option>
                  <option value="Financial Support">Financial Support</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  Details *
                </label>
                <textarea
                  required
                  name="details"
                  value={helpNowData.details}
                  onChange={handleHelpNowChange}
                  rows={4}
                  placeholder="What can you provide and when?"
                  className="w-full px-4 py-3 border border-border bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                />
              </div>

              {renderSubmitButton(
                <Button type="submit" isLoading={loading} className="w-full py-4">
                  Submit Help Offer
                </Button>,
                helpNowData,
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default withFormAuth(PoorNeedy);
