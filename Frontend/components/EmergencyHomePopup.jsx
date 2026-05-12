import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaHeart, FaChevronRight } from "react-icons/fa";
import { API_URL } from "../utils/apiConfig.js";

const EmergencyHomePopup = () => {
  const [data, setData] = useState(null);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_URL}/emergency-fundraisers/public/popup`)
      .then((res) => {
        if (cancelled) return;
        const payload = res?.data;
        // Backend filters for isActive:true and showPopup:true
        const isValid = payload && typeof payload === "object" && (payload._id || payload.slug);
        setData(isValid ? payload : null);
      })
      .catch((err) => {
        console.error("Popup fetch failed:", err);
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!data?._id) return;
    const key = `hc_emergency_popup_dismissed_${String(data._id)}`;
    setClosed(!!sessionStorage.getItem(key));
  }, [data]);

  const dismiss = () => {
    if (data?._id) {
      sessionStorage.setItem(`hc_emergency_popup_dismissed_${String(data._id)}`, "1");
    }
    setClosed(true);
  };

  const isVisible = !loading && data && !closed;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={String(data._id || data.slug || "emergency-popup")}
          initial={{ opacity: 0, y: 100, scale: 0.9, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(20px)" }}
          transition={{ 
            type: "spring", 
            damping: 30, 
            stiffness: 150,
            duration: 0.6 
          }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:right-10 md:bottom-10 z-[10000] w-[calc(100vw-2rem)] sm:w-[340px] pointer-events-auto"
        >
          <div className="relative rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 bg-[#0d0d0d] text-white">
            {/* Action Header Image */}
            <div className="relative h-32 sm:h-36 overflow-hidden">
              {(data.photos?.[0] || data.bannerImage) ? (
                <img 
                  src={data.photos?.[0] || data.bannerImage} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blood/40 to-[#1a1a1a]">
                  <FaHeart size={40} className="text-blood/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blood text-white text-[8px] font-black uppercase tracking-wider shadow-2xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Urgent
                </span>
              </div>

              <button
                type="button"
                onClick={dismiss}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-blood text-white backdrop-blur-xl transition-all border border-white/20 group/close z-10"
                aria-label="Close"
              >
                <FaTimes size={12} className="group-hover/close:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="p-4 pt-1 space-y-3">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                  Emergency Appeal
                </span>
                <h3 className="text-lg font-black leading-tight tracking-tight text-white">
                  {data.title}
                </h3>
                <p className="text-[11px] text-white/70 leading-relaxed font-medium line-clamp-3">
                  {data.medicalCondition ? `${data.medicalCondition}: ` : ""}{data.shortDescription || "This family needs your immediate support for life-saving medical treatment."}
                </p>
              </div>

              {/* Stats & Progress */}
              <div className="space-y-2.5 bg-white/5 rounded-2xl p-3.5 border border-white/5">
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Raised</span>
                    <p className="text-sm font-black text-blood">₹{(data.raisedAmount || 0).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Goal</span>
                    <p className="text-xs font-bold text-white/70">₹{(data.targetAmount || 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (data.raisedAmount / data.targetAmount) * 100)}%` }}
                      transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-blood to-red-500 rounded-full relative" 
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/30">
                    <span>{Math.round((data.raisedAmount / data.targetAmount) * 100)}% Funded</span>
                    <span>{data.supportersCount || 0} Donors</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/emergency-funding/${data.slug}`}
                  onClick={dismiss}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white text-black font-black text-[10px] uppercase tracking-wider shadow-lg hover:bg-blood hover:text-white transition-all duration-300 group/btn"
                >
                  <span>Donate Now</span>
                  <FaChevronRight size={9} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              
              <p className="text-center text-[8px] text-white/20 font-bold tracking-widest uppercase pb-1">
                Help Save a Life Today
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmergencyHomePopup;
