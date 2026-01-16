import React, { useState, useLayoutEffect, useRef } from 'react';
import { useTranslation } from "react-i18next";
import gsap from 'gsap';
import ChatPopup from './ChatPopup';

const ContactFloatingButton = () => {
  const { t } = useTranslation();
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const buttonRef = useRef(null);

  useLayoutEffect(() => {
    let observer;
    let timeoutId;

    const setupObserver = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        observer = new IntersectionObserver(
          ([entry]) => {
            setIsFooterVisible(entry.isIntersecting);
          },
          { threshold: 0.1 }
        );
        observer.observe(footer);
      } else {
        // Retry after a short delay if footer not found (due to lazy loading)
        timeoutId = setTimeout(setupObserver, 500);
      }
    };

    setupObserver();

    return () => {
      if (observer) observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
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
        className="fixed bottom-6 left-6 z-50 p-4 bg-primary rounded-full shadow-2xl hover:bg-secondary transition-all duration-300 flex items-center justify-center group opacity-0"
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

      {/* Contact Button - Bottom Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsPopupOpen(!isPopupOpen);
        }}
        className={`fixed bottom-6 right-6 z-[110] p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group ${isPopupOpen ? 'bg-[#1A1A1A] rotate-90' : 'bg-primary hover:scale-110'}`}
        aria-label={t("footer.contact_us")}
      >
        {isPopupOpen ? (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-white fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
        {!isPopupOpen && (
          <span className="absolute right-full mr-4 bg-[#1A1A1A] text-white text-xs px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {t("footer.contact_us")}
          </span>
        )}
      </button>

      <ChatPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
    </>
  );
};

export default ContactFloatingButton;
