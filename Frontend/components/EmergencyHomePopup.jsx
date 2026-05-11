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
          className="fixed bottom-6 right-6 md:right-10 md:bottom-10 z-[9999] w-[calc(100vw-3rem)] sm:w-[420px] pointer-events-auto"
        >
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.5)] border border-white/10 bg-[#0d0d0d] text-white">
            {/* Action Header Image */}
            <div className="relative h-56 sm:h-64 overflow-hidden">
              {(data.photos?.[0] || data.bannerImage) ? (
                <img 
                  src={data.photos?.[0] || data.bannerImage} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blood/40 to-[#1a1a1a]">
                  <FaHeart size={64} className="text-blood/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/20 to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blood text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Critical Need
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">
                  Verified Case
                </span>
              </div>

              <button
                type="button"
                onClick={dismiss}
                className="absolute top-6 right-6 p-3 rounded-full bg-black/40 hover:bg-blood/80 text-white backdrop-blur-md transition-all border border-white/10 group/close"
                aria-label="Close"
              >
                <FaTimes size={16} className="group-hover/close:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="p-8 pt-2 space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                  {data.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">
                  {data.medicalCondition ? `${data.medicalCondition}: ` : ""}{data.shortDescription || "This family needs your immediate support for life-saving medical treatment."}
                </p>
              </div>

              {/* Stats & Progress */}
              <div className="space-y-4 bg-white/5 rounded-[2rem] p-6 border border-white/5">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Raised so far</span>
                    <p className="text-xl font-black text-blood">₹{(data.raisedAmount || 0).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Goal</span>
                    <p className="text-lg font-bold text-white/80">₹{(data.targetAmount || 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (data.raisedAmount / data.targetAmount) * 100)}%` }}
                      transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-blood via-red-500 to-primary rounded-full relative" 
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                    </motion.div>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                    <span>{Math.round((data.raisedAmount / data.targetAmount) * 100)}% Funded</span>
                    <span>{data.supportersCount || 0} Supporters</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/emergency-funding/${data.slug}`}
                  onClick={dismiss}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white text-black font-black text-[13px] uppercase tracking-[0.2em] shadow-xl hover:bg-blood hover:text-white transition-all duration-300 group/btn"
                >
                  <span>Donate Now</span>
                  <FaChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <p className="text-center text-[10px] text-white/20 font-medium tracking-widest uppercase pb-2">
                Every second counts in this emergency
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmergencyHomePopup;
