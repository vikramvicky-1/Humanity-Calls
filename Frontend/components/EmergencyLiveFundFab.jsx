import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHeart, FaBolt } from "react-icons/fa";

/**
 * Persistent “live” call-to-action — bottom-right, above the contact FAB.
 * Hidden on admin and on emergency funding routes (already there).
 */
const EmergencyLiveFundFab = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith("/admin")) return null;
  if (pathname === "/emergency-funding" || pathname.startsWith("/emergency-funding/")) return null;

  return (
    <motion.div
      className="fixed right-3 sm:right-5 z-[125] flex flex-col items-end gap-1 pointer-events-none"
      style={{ bottom: "max(6rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))" }}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.35 }}
    >
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-auto"
      >
        <span className="absolute -inset-1 rounded-full bg-blood/40 blur-md opacity-80 animate-pulse" aria-hidden />
        <Link
          to="/emergency-funding"
          className="relative flex items-center gap-2 sm:gap-3 pl-3 pr-4 sm:pl-4 sm:pr-5 py-3 min-h-[48px] rounded-full bg-gradient-to-r from-blood via-[#c62828] to-primary text-white font-black text-[11px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-[0.18em] shadow-[0_12px_40px_rgba(198,40,40,0.45)] border border-white/25 ring-2 ring-white/10 touch-manipulation active:scale-[0.98] transition-transform"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 border border-white/20">
            <FaBolt className="text-amber-200 text-sm sm:text-base" />
          </span>
          <span className="flex flex-col leading-tight text-left">
            <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-amber-100/95 font-black tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Live
            </span>
            <span className="text-[11px] sm:text-sm tracking-tight font-black normal-case">
              Fund now · Save a life
            </span>
          </span>
          <FaHeart className="text-white/90 text-sm sm:text-base shrink-0 opacity-90" />
        </Link>
      </motion.div>
      <span className="pointer-events-none text-[9px] font-bold text-text-body/50 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md shadow-sm mr-1">
        Emergency funding
      </span>
    </motion.div>
  );
};

export default EmergencyLiveFundFab;
