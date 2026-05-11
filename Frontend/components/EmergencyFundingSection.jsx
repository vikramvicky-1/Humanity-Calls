import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FaHeart, FaArrowRight, FaBolt } from "react-icons/fa";
import { API_URL } from "../utils/apiConfig.js";

const EmergencyFundingSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/emergency-fundraisers/public?featured=true`)
      .then((res) => {
        const raw = res?.data;
        setItems(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-[#fff5f5] to-white border-y border-red-100/60">
        <div className="max-w-none mx-auto px-[5%]">
          <div className="h-10 w-48 bg-red-100/80 rounded-xl animate-pulse mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-3xl bg-red-50/80 animate-pulse border border-red-100/50" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-[#fff8f8] via-white to-[#fafafa] border-y border-red-100/50">
      <div className="max-w-none mx-auto px-[5%]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-14">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-blood"
            >
              <FaBolt /> Emergency funding
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-[#1a1a1a] mt-3 tracking-tight"
              style={{ fontFamily: '"Syne", sans-serif' }}
            >
              Help save a <span className="text-primary italic">life today</span>
            </motion.h2>
            <p className="mt-3 text-text-body/70 max-w-xl text-sm md:text-base font-medium leading-relaxed">
              Verified medical emergencies. Every rupee reaches the family through Humanity Calls.
            </p>
          </div>
          <Link
            to="/emergency-funding"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-primary text-primary font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shrink-0"
          >
            View all <FaArrowRight size={11} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.map((f, idx) => {
            const cover = f.photos?.[0] || f.bannerImage;
            const pct = f.progressPercentage ?? 0;
            const pending = f.pendingAmount ?? Math.max(0, (f.targetAmount || 0) - (f.raisedAmount || 0));
            return (
              <motion.article
                key={f._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="group bg-white rounded-[2rem] border border-black/6 shadow-sm hover:shadow-2xl hover:shadow-primary/10 overflow-hidden flex flex-col"
              >
                <Link to={`/emergency-funding/${f.slug}`} className="block relative aspect-[16/10] overflow-hidden">
                  {cover ? (
                    <img src={cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blood/20 flex items-center justify-center text-primary/40">
                      <FaHeart size={48} />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blood text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Urgent
                  </span>
                  {f.goalReached ? (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest">
                      Goal reached
                    </span>
                  ) : null}
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-black text-[#1a1a1a] line-clamp-2 group-hover:text-primary transition-colors">
                    <Link to={`/emergency-funding/${f.slug}`}>{f.title}</Link>
                  </h3>
                  <p className="text-sm text-text-body/65 line-clamp-2 mt-2 flex-1">{f.shortDescription}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-text-body/50 uppercase tracking-wider">
                      <span>Raised ₹{(f.raisedAmount || 0).toLocaleString("en-IN")}</span>
                      <span>Goal ₹{(f.targetAmount || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-black/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${f.goalReached ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-blood"}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-blood">{pct}% funded</span>
                      <span className="text-text-body/60">{f.supportersCount || 0} supporters</span>
                    </div>
                    <p className="text-[11px] font-bold text-amber-800/90">
                      ₹{pending.toLocaleString("en-IN")} still needed
                    </p>
                  </div>
                  <Link
                    to={`/emergency-funding/${f.slug}`}
                    className="mt-5 w-full py-3.5 rounded-xl bg-[#1a1a2e] text-white text-center font-black text-xs uppercase tracking-widest hover:bg-primary transition-colors"
                  >
                    Donate &amp; share
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EmergencyFundingSection;
