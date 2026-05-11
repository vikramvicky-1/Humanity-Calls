import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaHeart, FaChevronRight } from "react-icons/fa";

const EmergencyHomePopup = () => {
  const [data, setData] = useState(null);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${import.meta.env.VITE_API_URL}/emergency-fundraisers/public/popup`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
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
    const key = `hc_emergency_popup_dismissed_${data._id}`;
    if (sessionStorage.getItem(key)) setClosed(true);
  }, [data]);

  const dismiss = () => {
    if (data?._id) sessionStorage.setItem(`hc_emergency_popup_dismissed_${data._id}`, "1");
    setClosed(true);
  };

  if (loading || !data || closed) return null;

  const img = data.photos?.[0] || data.bannerImage;
  const slug = data.slug;
  const pending = data.pendingAmount ?? Math.max(0, (data.targetAmount || 0) - (data.raisedAmount || 0));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        className="fixed bottom-48 left-4 right-4 md:left-auto md:right-5 md:bottom-28 z-[900] max-w-md md:max-w-lg mx-auto md:mx-0 pointer-events-auto md:max-w-sm"
      >
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-[#1a1a2e] text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blood/40 via-transparent to-primary/30 pointer-events-none" />
          <button
            type="button"
            onClick={dismiss}
            className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Close"
          >
            <FaTimes />
          </button>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 p-5 sm:p-6">
            <div className="shrink-0 w-full sm:w-28 h-40 sm:h-28 rounded-2xl overflow-hidden bg-black/20 border border-white/10">
              {img ? (
                <img src={img} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <FaHeart size={36} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-300">
                Urgent — lives need you
              </span>
              <h3 className="text-lg sm:text-xl font-black leading-tight line-clamp-2">{data.title}</h3>
              <p className="text-xs text-white/70 line-clamp-2">{data.shortDescription}</p>
              <div className="flex flex-wrap gap-3 text-[11px] font-bold mt-1">
                <span className="px-2 py-1 rounded-lg bg-white/10">
                  Raised: ₹{(data.raisedAmount || 0).toLocaleString("en-IN")}
                </span>
                <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-200">
                  Need: ₹{pending.toLocaleString("en-IN")}
                </span>
              </div>
              <Link
                to={`/emergency-funding/${slug}`}
                onClick={dismiss}
                className="mt-2 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 transition-colors"
              >
                Donate now <FaChevronRight size={10} />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmergencyHomePopup;
