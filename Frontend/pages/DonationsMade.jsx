import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import { FaHeart, FaArrowRight } from "react-icons/fa";

/** When false, public donation cards are hidden (page still shows hero + CTA). */
const SHOW_PUBLIC_DONATION_CARDS = false;

const DonationsMade = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <SEO
        title={t("donations_made.seo_title") || "Donations Made | Humanity Calls"}
        description={t("donations_made.seo_desc") || "View our transparency report and see how your donations are making a difference."}
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 rounded-l-[10rem] -z-10 translate-x-1/2 blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto px-[5%] text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <FaHeart className="text-[10px] animate-pulse" /> Transparency Report
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-[#1A1A1A] tracking-tight uppercase leading-[1.1] mb-6"
          >
            {t("donations_made.hero_text")}
            <br />
            <span className="text-primary">{t("donations_made.our_members")}</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-gray-500 font-medium text-base leading-relaxed mb-4"
          >
            Your trust is our foundation. Every contribution listed here has been verified and deployed to serve humanity. Thank you for your unconditional support.
          </motion.p>
        </div>
      </section>

      {/* Donations listing — cards hidden until enabled again */}
      <section className="py-10 max-w-7xl mx-auto px-[5%]">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tight">Recent Contributions</h2>
            <div className="h-1.5 w-20 bg-primary rounded-full" />
          </div>
        </div>

        {SHOW_PUBLIC_DONATION_CARDS ? null : (
          <div className="text-center py-16 md:py-20 bg-white rounded-[3rem] border border-black/6 shadow-sm max-w-2xl mx-auto px-6">
            <p className="text-text-body/70 font-medium leading-relaxed">
              Verified donation listings are temporarily hidden while we refresh our transparency report. Thank you for your patience.
            </p>
            <p className="text-sm text-text-body/50 mt-4 font-bold">
              You can still support our work through the donate page anytime.
            </p>
          </div>
        )}
      </section>

      {/* Donate Now CTA */}
      <section className="py-20 px-[5%]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-10 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/40"
        >
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blood/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-lg">
               <FaHeart className="text-white animate-pulse" size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none">
               Want to contribute?
            </h2>
            <p className="text-white/80 font-medium text-lg leading-relaxed">
              Your small contribution can save a life, feed a family, or rescue an animal in distress. 
              Join our mission today and be the change you wish to see.
            </p>
            <div className="pt-4">
              <Link to="/donate" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:scale-105 active:scale-95 transition-all group">
                Donate Now
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default DonationsMade;
