import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import ContactForm from "./ContactForm";

const ChatPopup = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking the popup or the floating toggle button
      const floatingButton = document.querySelector(
        'button[aria-label="' + t("footer.contact_us") + '"]'
      );
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        (!floatingButton || !floatingButton.contains(event.target))
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="fixed bottom-24 right-6 z-[100] w-[90vw] sm:w-[400px] bg-[#1A1A1A] rounded-2xl shadow-2xl border border-[#2A2A2A] overflow-hidden transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="bg-[#B71C1C] p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold leading-tight">
              {t("footer.contact_us")}
            </h3>
            <p className="text-white/80 text-xs">
              {t("humanitycallsnotify@gmail.com") || "We're here to help"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors p-1"
          aria-label="Close popup"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <ContactForm className="!space-y-4" />
      </div>
    </div>
  );
};

export default ChatPopup;
