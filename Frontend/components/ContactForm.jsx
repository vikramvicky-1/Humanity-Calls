import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import { sendEmail } from "../utils/email";

const ContactForm = ({ className = "" }) => {
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
        className="w-full px-4 py-4 bg-[#2A2A2A] border border-transparent rounded-md focus:border-[#B71C1C] focus:bg-[#333333] outline-none transition-all text-white"
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
          className="w-full px-4 py-4 bg-[#2A2A2A] border border-transparent rounded-md focus:border-[#B71C1C] focus:bg-[#333333] outline-none transition-all text-white"
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
          className="w-full px-4 py-4 bg-[#2A2A2A] border border-transparent rounded-md focus:border-[#B71C1C] focus:bg-[#333333] outline-none transition-all text-white"
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
        className="w-full px-4 py-4 bg-[#2A2A2A] border border-transparent rounded-md focus:border-[#B71C1C] focus:bg-[#333333] outline-none transition-all resize-none text-white"
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
