import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import SEO from "../components/SEO";
import { motion } from "framer-motion";
import { FaHeart, FaShareAlt, FaBolt, FaHandHoldingHeart } from "react-icons/fa";
import { buildEmergencyShareUrls, trackEmergencyEvent } from "../utils/emergencyShare";
import { toast } from "react-toastify";
import { API_URL } from "../utils/apiConfig.js";

const EmergencyFunding = () => {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/emergency-fundraisers/public`)
      .then((res) => {
        const raw = res?.data;
        setList(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {
        setList([]);
        toast.error(t("emergency.load_error"));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && list.length > 0) {
      trackEmergencyEvent("list_view", "");
    }
  }, [loading, list.length]);

  const share = (f) => {
    trackEmergencyEvent("share_whatsapp", f.slug);
    const url = f.shareLink || `${window.location.origin}/emergency-funding/${f.slug}`;
    const urls = buildEmergencyShareUrls({
      pageUrl: url,
      title: f.title,
      summary: f.shortDescription,
    });
    if (navigator.share) {
      navigator
        .share({ title: f.title, text: f.shortDescription, url })
        .catch(() => window.open(urls.whatsapp, "_blank"));
    } else {
      window.open(urls.whatsapp, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SEO title={t("emergency.meta_list_title")} description={t("emergency.meta_list_desc")} />

      <section className="relative pt-20 pb-14 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 overflow-hidden bg-gradient-to-br from-[#1a0a0a] via-[#2d1212] to-[#1a1a2e] text-white">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#c62828_0%,transparent_50%)]" />
        <div className="max-w-5xl mx-auto px-[5%] sm:px-6 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-amber-200 text-[10px] font-black uppercase tracking-[0.35em] border border-white/10">
            <FaBolt /> {t("emergency.hero_kicker")}
          </span>
          <h1 className="mt-5 sm:mt-6 text-2xl sm:text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-white px-1">
            {t("emergency.hero_title")}
          </h1>
          <p className="mt-5 sm:mt-6 text-white/75 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            {t("emergency.hero_sub")}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-[5%] sm:px-6 py-10 sm:py-12 md:py-16">
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-white border border-black/5 shadow animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-black/10">
            <FaHandHoldingHeart className="mx-auto text-5xl text-primary/20 mb-4" />
            <h2 className="text-xl sm:text-2xl font-black text-text-body">{t("emergency.empty_title")}</h2>
            <p className="text-text-body/60 mt-2 max-w-md mx-auto text-sm sm:text-base">{t("emergency.empty_sub")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
            {list.map((f, idx) => {
              const cover = f.photos?.[0] || f.bannerImage;
              const pct = f.progressPercentage ?? 0;
              const pending = f.pendingAmount ?? Math.max(0, (f.targetAmount || 0) - (f.raisedAmount || 0));
              return (
                <motion.article
                  key={f._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-[2rem] overflow-hidden border border-black/6 shadow-[0_8px_40px_rgba(0,0,0,0.06)] flex flex-col hover:shadow-[0_20px_50px_rgba(198,40,40,0.12)] transition-shadow duration-500"
                >
                  <Link
                    to={`/emergency-funding/${f.slug}`}
                    onClick={() => trackEmergencyEvent("list_card_open", f.slug)}
                    className="relative aspect-[16/10] block overflow-hidden group"
                  >
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center text-primary/30">
                        <FaHeart size={56} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-blood text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                        {t("emergency.section_urgent")}
                      </span>
                      {f.goalReached ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest">
                          {t("emergency.section_goal")}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                  <div className="p-6 md:p-7 flex flex-col flex-1">
                    <h2 className="text-xl md:text-2xl font-black text-[#1a1a1a] leading-snug line-clamp-2">
                      <Link
                        to={`/emergency-funding/${f.slug}`}
                        onClick={() => trackEmergencyEvent("list_card_open", f.slug)}
                        className="hover:text-primary transition-colors"
                      >
                        {f.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-text-body/65 mt-3 line-clamp-3 flex-1">{f.shortDescription}</p>
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-text-body/45">
                        <span>{t("emergency.raised")}</span>
                        <span>{t("emergency.goal")}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black">
                        <span className="text-primary">₹{(f.raisedAmount || 0).toLocaleString("en-IN")}</span>
                        <span className="text-text-body/70">₹{(f.targetAmount || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="h-3 rounded-full bg-black/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${f.goalReached ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-blood"}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap justify-between gap-2 text-xs font-bold text-text-body/60">
                        <span>{pct}% {t("emergency.complete")}</span>
                        <span>{t("emergency.section_supporters", { count: f.supportersCount || 0 })}</span>
                        <span className="text-blood w-full sm:w-auto">
                          {t("emergency.section_needed", { amount: pending.toLocaleString("en-IN") })}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <Link
                        to={`/emergency-funding/${f.slug}`}
                        onClick={() => trackEmergencyEvent("list_card_open", f.slug)}
                        className="flex-1 py-3.5 rounded-xl bg-[#1a1a2e] text-white text-center font-black text-xs uppercase tracking-widest hover:bg-primary transition-colors"
                      >
                        {t("emergency.donate")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => share(f)}
                        className="px-4 rounded-xl border-2 border-black/10 hover:border-primary hover:text-primary transition-colors"
                        aria-label={t("emergency.share_aria")}
                      >
                        <FaShareAlt />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default EmergencyFunding;
