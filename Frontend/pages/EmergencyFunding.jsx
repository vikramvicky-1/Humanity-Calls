import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SEO from "../components/SEO";
import { motion } from "framer-motion";
import { FaHeart, FaShareAlt, FaBolt, FaHandHoldingHeart } from "react-icons/fa";
import { buildEmergencyShareUrls, copyEmergencyLink } from "../utils/emergencyShare";
import { toast } from "react-toastify";
import { API_URL } from "../utils/apiConfig.js";

const EmergencyFunding = () => {
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
        toast.error("Could not load emergency fundraisers");
      })
      .finally(() => setLoading(false));
  }, []);

  const share = (f) => {
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
      <SEO
        title="Emergency Funding | Humanity Calls"
        description="Support verified medical emergencies. Transparent crowdfunding by Humanity Calls Trust."
      />

      <section className="relative pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden bg-gradient-to-br from-[#1a0a0a] via-[#2d1212] to-[#1a1a2e] text-white">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#c62828_0%,transparent_50%)]" />
        <div className="max-w-5xl mx-auto px-[5%] relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-amber-200 text-[10px] font-black uppercase tracking-[0.35em] border border-white/10">
            <FaBolt /> Emergency crowdfunding
          </span>
          <h1 className="mt-6 text-3xl md:text-6xl font-black tracking-tight leading-[1.1]">
            When minutes matter, <span className="text-amber-300 italic">your help</span> saves lives
          </h1>
          <p className="mt-6 text-white/75 text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Every campaign is verified by our team. Donate directly via bank or UPI and share with your network.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-[5%] py-12 md:py-16">
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-white border border-black/5 shadow animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-black/10">
            <FaHandHoldingHeart className="mx-auto text-5xl text-primary/20 mb-4" />
            <h2 className="text-2xl font-black text-text-body">No active fundraisers</h2>
            <p className="text-text-body/60 mt-2 max-w-md mx-auto">Please check back soon. Follow us for urgent alerts.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
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
                  <Link to={`/emergency-funding/${f.slug}`} className="relative aspect-[16/10] block overflow-hidden group">
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
                        Urgent
                      </span>
                      {f.goalReached ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest">
                          Goal reached
                        </span>
                      ) : null}
                    </div>
                  </Link>
                  <div className="p-6 md:p-7 flex flex-col flex-1">
                    <h2 className="text-xl md:text-2xl font-black text-[#1a1a1a] leading-snug line-clamp-2">
                      <Link to={`/emergency-funding/${f.slug}`} className="hover:text-primary transition-colors">
                        {f.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-text-body/65 mt-3 line-clamp-3 flex-1">{f.shortDescription}</p>
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-text-body/45">
                        <span>Raised</span>
                        <span>Goal</span>
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
                        <span>{pct}% complete</span>
                        <span>{f.supportersCount || 0} supporters</span>
                        <span className="text-blood w-full sm:w-auto">₹{pending.toLocaleString("en-IN")} pending</span>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <Link
                        to={`/emergency-funding/${f.slug}`}
                        className="flex-1 py-3.5 rounded-xl bg-[#1a1a2e] text-white text-center font-black text-xs uppercase tracking-widest hover:bg-primary transition-colors"
                      >
                        Donate
                      </Link>
                      <button
                        type="button"
                        onClick={() => share(f)}
                        className="px-4 rounded-xl border-2 border-black/10 hover:border-primary hover:text-primary transition-colors"
                        aria-label="Share"
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
