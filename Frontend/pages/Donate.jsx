import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MdAccountBalanceWallet } from "react-icons/md";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { sendEmail } from "../utils/email";
import withFormAuth from "../components/withFormAuth";

gsap.registerPlugin(ScrollTrigger);

const Donate = ({
  user,
  isFieldDisabled,
  renderSubmitButton,
  loadPendingFormData,
  clearPendingFormData,
}) => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);

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
            ease: "power2.out",
            scrollTrigger: {
              trigger: title,
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

  const [formData, setFormData] = useState(() => {
    const saved = loadPendingFormData();
    return (
      saved || {
        name: "",
        email: user?.email || "",
        phone: "",
        amount: "",
        transactionId: "",
      }
    );
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const success = await sendEmail(
      "Donation Inquiry",
      formData,
      `New Donation from ${formData.name}`,
    );

    if (success) {
      clearPendingFormData();
      setFormData({
        name: "",
        email: user?.email || "",
        phone: "",
        amount: "",
        transactionId: "",
      });
    }
    setLoading(false);
  };

  return (
    <div className="bg-bg min-h-screen py-24" ref={containerRef}>
      <SEO title={t("donate.seo_title")} description={t("donate.seo_desc")} />

      <div className="max-w-none mx-auto px-[5%] grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div data-animation="donate-title" className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
              {t("donate.title")}
            </h1>
            <p className="text-lg text-text-body/80 leading-relaxed max-w-xl">
              {t("donate.description")}
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-border shadow-sm space-y-6">
            <div className="space-y-4 text-center">
              <h4 className="font-bold text-xl text-gray-800">
                {t("donate.scan_pay_text")}
              </h4>
              <div className="relative inline-block group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blood rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <img
                  src="https://res.cloudinary.com/daokrum7i/image/upload/v1768833314/hc_donation_qr_syuyxj.jpg"
                  alt="Donation QR Code"
                  className="relative rounded-xl border-4 border-white shadow-2xl w-64 h-64 mx-auto object-contain"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider mb-1">
                  {t("donate.upi_id_label")}
                </p>
                <p className="text-2xl font-bold text-primary select-all">
                  {t("donate.upi_id_value")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
              <MdAccountBalanceWallet className="text-primary" />
              {t("donate.why_donate_title")}
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {t("donate.why_donate_list", { returnObjects: true }).map(
                (item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-primary font-bold">•</span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div
          className="bg-white p-8 md:p-12 rounded-3xl border border-border shadow-2xl sticky top-24"
          data-animation="donate-form"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800">
              {t("donate.form_title")}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Please fill the details after making the payment
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("donate.full_name")}
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("donate.placeholders.name")}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("donate.email_address")}
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("donate.placeholders.email")}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isFieldDisabled("email")}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("donate.phone_number")}
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  minLength={10}
                  maxLength={10}
                  placeholder={t("donate.placeholders.phone")}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("donate.donation_amount")}
                </label>
                <input
                  required
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder={t("donate.placeholders.amount")}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("donate.transaction_id")}
                </label>
                <input
                  required
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  placeholder={t("donate.placeholders.transaction_id")}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
            {renderSubmitButton(
              <Button
                type="submit"
                isLoading={loading}
                className="w-full py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 mt-4"
              >
                Submit Donation Details
              </Button>,
              formData,
            )}
            <p className="text-center text-xs text-gray-400 mt-4">
              Your data is secured with end-to-end encryption
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default withFormAuth(Donate);
