import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import Button from "./Button";
import ContactForm from "./ContactForm";
import { SOCIAL_LINKS } from "../constants";
import { animateFooterElements } from "../utils/animations";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const footerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      animateFooterElements();
    }, footerRef);
    return () => ctx.revert();
  }, [i18n.language]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#1A1A1A] text-white pt-20 pb-10" ref={footerRef}>
      <div className="max-w-none mx-auto px-[5%]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div id="contact">
            <h3 className="text-3xl font-bold mb-8 text-white relative">
              {t("footer.contact_us")}
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-[#B71C1C]"></span>
            </h3>
            <ContactForm />
          </div>

          {/* Quick Links & Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-8 text-white tracking-wide uppercase">
                {t("footer.quick_links")}
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/about"
                    className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center focus:outline-none focus:ring-1 focus:ring-[#B71C1C] rounded px-1"
                  >
                    {t("common.about_us")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/request-donors"
                    className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center focus:outline-none focus:ring-1 focus:ring-[#B71C1C] rounded px-1"
                  >
                    {t("common.request_for_donors")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/poor-needy"
                    className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center focus:outline-none focus:ring-1 focus:ring-[#B71C1C] rounded px-1"
                  >
                    {t("common.poor_needy")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/animal-rescue"
                    className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center focus:outline-none focus:ring-1 focus:ring-[#B71C1C] rounded px-1"
                  >
                    {t("common.animal_rescue")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/volunteer"
                    className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center focus:outline-none focus:ring-1 focus:ring-[#B71C1C] rounded px-1"
                  >
                    {t("common.volunteer")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/collaborate"
                    className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center focus:outline-none focus:ring-1 focus:ring-[#B71C1C] rounded px-1"
                  >
                    {t("common.collaborate")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-8 text-white tracking-wide uppercase">
                {t("footer.get_in_touch")}
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">
                    {t("footer.office_address_title")}
                  </p>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {t("footer.office_address_value")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">
                    {t("footer.email_inquiries")}
                  </p>
                  <a
                    href="mailto:humanitycallsnotify@gmail.com"
                    className="text-white hover:text-[#B71C1C] transition-colors"
                  >
                    humanitycallsnotify@gmail.com
                  </a>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">
                    {t("footer.phone_numbers")}
                  </p>
                  <a
                    href="tel:+918867713031"
                    className="text-white hover:text-[#B71C1C] transition-colors"
                  >
                    +91 8867713031
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-[#2A2A2A] flex flex-col items-center">
          <div className="flex space-x-8 mb-8">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-[#B71C1C] rounded p-1"
                aria-label={`Follow us on ${social.name}`}
              >
                <social.icon className="w-6 h-6" />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs text-gray-300 font-medium">
            <Link
              to="/terms"
              className="hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-[#B71C1C] rounded px-1"
            >
              {t("footer.terms_conditions")}
            </Link>
            <Link
              to="/privacy"
              className="hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-[#B71C1C] rounded px-1"
            >
              {t("footer.privacy_policy")}
            </Link>
            <Link
              to="/disclaimer"
              className="hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-[#B71C1C] rounded px-1"
            >
              {t("footer.disclaimer")}
            </Link>
          </div>

          <p className="text-sm text-gray-300 text-center">
            {t("footer.rights_reserved", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs font-bold text-gray-300 text-center mt-4">
            {t("footer.designed_developed")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
