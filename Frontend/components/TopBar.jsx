import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaCommentDots } from "react-icons/fa";
import { HiLanguage } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import FeedbackModal from "./FeedbackModal";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "ml", label: "മലയാളം", flag: "🇮🇳" },
];

const TopBar = () => {
  const { i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const langRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-[#C62828] via-[#ad2020] to-[#8B0000] text-white relative z-[60]">
        <div className="max-w-none mx-auto px-[5%] flex items-center justify-between h-8 sm:h-9">
          {/* Left: Feedback */}
          <button
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-white/80 hover:text-white transition-colors group"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <FaCommentDots className="text-[10px] sm:text-xs text-white/60 group-hover:text-yellow-300 transition-colors" />
            <span>Feedback</span>
          </button>

          {/* Center: Tagline */}
          <p
            className="text-[7px] sm:text-[9px] md:text-[10px] font-bold text-white/40 tracking-[0.15em] sm:tracking-[0.2em] uppercase text-center"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Helping Humanity, Saving Lives
          </p>

          {/* Right: Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-white/80 hover:text-white transition-colors group"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <HiLanguage className="text-sm sm:text-base text-white/60 group-hover:text-yellow-300 transition-colors" />
              <span className="hidden sm:inline">{currentLang.label}</span>
              <FaChevronDown
                className={`text-[7px] text-white/40 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,16rem)] max-h-[min(70vh,22rem)] overflow-y-auto bg-white rounded-xl shadow-2xl shadow-black/20 border border-black/5 overflow-x-hidden z-[100]"
                >
                  <div className="p-1.5">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLang(lang.code)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-xs font-bold ${
                          i18n.language === lang.code
                            ? "bg-blood/5 text-blood"
                            : "text-black/60 hover:bg-black/3 hover:text-black"
                        }`}
                        style={{ fontFamily: '"Poppins", sans-serif' }}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.label}</span>
                        {i18n.language === lang.code && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blood" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
};

export default TopBar;
