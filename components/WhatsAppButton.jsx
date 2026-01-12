import React, { useState, useLayoutEffect, useRef } from 'react';
import { useTranslation } from "react-i18next";
import gsap from 'gsap';
import { WHATSAPP_NUMBER } from '../constants';

const WhatsAppButton = () => {
  const { t } = useTranslation();
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const buttonRef = useRef(null);

  useLayoutEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const footer = document.querySelector('footer');
    if (footer) {
      observer.observe(footer);
    }

    return () => {
      if (footer) observer.unobserve(footer);
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (buttonRef.current) {
        if (isFooterVisible) {
          gsap.to(buttonRef.current, {
            duration: 0.5,
            opacity: 1,
            pointerEvents: 'auto',
            ease: 'power2.out',
          });
        } else {
          gsap.to(buttonRef.current, {
            duration: 0.5,
            opacity: 0,
            pointerEvents: 'none',
            ease: 'power2.in',
          });
        }
      }
    }, buttonRef);
    return () => ctx.revert();
  }, [isFooterVisible]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Back to Top Button - Bottom Left */}
      <button
        ref={buttonRef}
        onClick={scrollToTop}
        className="fixed bottom-6 left-6 z-50 p-4 bg-[#B71C1C] rounded-full shadow-2xl hover:bg-[#8E1616] transition-all duration-300 flex items-center justify-center group opacity-0"
        style={{ pointerEvents: 'none' }}
        aria-label="Back to Top"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
        <span className="absolute bottom-full mb-4 bg-[#1A1A1A] text-white text-xs px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {t("whatsapp.back_to_top")}
        </span>
      </button>

      {/* WhatsApp Button - Bottom Right */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("whatsapp.default_message"))}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
        aria-label={t("whatsapp.chat_with_us")}
      >
        <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 448 512">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.6-16.5-14.7-27.6-32.8-30.8-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.2 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
        <span className="absolute right-full mr-4 bg-[#1A1A1A] text-white text-xs px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {t("whatsapp.chat_with_us")}
        </span>
      </a>
    </>
  );
};

export default WhatsAppButton;
