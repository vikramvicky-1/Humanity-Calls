import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import { sendEmail } from "../utils/email";

const ContactForm = ({ className = "", dark = false }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const success = await sendEmail(
      "Contact Inquiry",
      formData,
      `New Contact Inquiry from ${formData.name}`
    );

    if (success) {
      setFormData({ name: "", email: "", phone: "", message: "" });
    }
    setLoading(false);
  };

  const inputClasses = `w-full px-4 py-4 ${
    dark
      ? "bg-[#2A2A2A] border-white/10 text-white placeholder-gray-500"
      : "bg-white border-border text-text-body"
  } border rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`;

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <input
        required
        name="name"
        value={formData.name}
        onChange={handleChange}
        type="text"
        placeholder={t("form.name")}
        aria-label={t("form.aria_name")}
        className={inputClasses}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          placeholder={t("form.email")}
          aria-label={t("form.aria_email")}
          className={inputClasses}
        />
        <input
          required
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          type="tel"
          minLength={10}
          maxLength={10}
          placeholder={t("form.phone")}
          aria-label={t("form.aria_phone")}
          className={inputClasses}
        />
      </div>
      <textarea
        required
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder={t("form.message")}
        aria-label={t("form.aria_message")}
        rows={4}
        className={`${inputClasses} resize-none`}
      ></textarea>
      <Button
        type="submit"
        isLoading={loading}
        className="w-full py-4 text-lg"
        aria-label={t("form.aria_send")}
      >
        {t("form.send_message")}
      </Button>
    </form>
  );
};

export default ContactForm;
