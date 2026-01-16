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
          <div id="contact" className=" p-8 rounded-2xl">
            <h3 className="text-3xl font-bold mb-8 text-white relative">
              {t("footer.contact_us")}
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-primary"></span>
            </h3>
            <ContactForm dark={true} />
          </div>

          {/* Quick Links & Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-8 text-white tracking-wide uppercase">
                {t("footer.quick_links")}
              </h3>
              <ul className="space-y-4">
                {[
                  { to: "/about", label: t("common.about_us") },
                  {
                    to: "/request-donors",
                    label: t("common.request_for_donors"),
                  },
                  { to: "/poor-needy", label: t("common.poor_needy") },
                  { to: "/animal-rescue", label: t("common.animal_rescue") },
                  { to: "/volunteer", label: t("common.volunteer") },
                  { to: "/collaborate", label: t("common.collaborate") },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-white hover:underline transition-all duration-300 flex items-center focus:outline-none focus:ring-2 focus:ring-white rounded px-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-8 text-white tracking-wide uppercase">
                {t("footer.get_in_touch")}
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {t("footer.office_address_title")}
                  </p>
                  <p className="text-white/80 leading-relaxed whitespace-pre-line">
                    {t("footer.office_address_value")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {t("footer.email_inquiries")}
                  </p>
                  <a
                    href="mailto:humanitycallsnotify@gmail.com"
                    className="text-white hover:text-gray-400 hover:underline transition-colors"
                  >
                    humanitycallsnotify@gmail.com
                  </a>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {t("footer.phone_numbers")}
                  </p>
                  <a
                    href="tel:+918867713031"
                    className="text-white hover:text-gray-400 hover:underline transition-colors"
                  >
                    +91 8867713031
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-white/10 flex flex-col items-center">
          <div className="flex space-x-8 mb-8">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
                aria-label={`Follow us on ${social.name}`}
              >
                <social.icon className="w-6 h-6" />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs text-white/60 font-medium">
            {[
              { to: "/terms", label: t("footer.terms_conditions") },
              { to: "/privacy", label: t("footer.privacy_policy") },
              { to: "/disclaimer", label: t("footer.disclaimer") },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded px-1"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="text-sm text-white/60 text-center">
            {t("footer.rights_reserved", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs font-bold text-white/40 text-center mt-4">
            {t("footer.designed_developed")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
