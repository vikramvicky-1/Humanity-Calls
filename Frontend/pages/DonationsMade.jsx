import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import SEO from "../components/SEO";
import { 
  FaHeart, 
  FaArrowRight, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaDonate,
  FaHandHoldingHeart
} from "react-icons/fa";

const DonationsMade = () => {
  const { t } = useTranslation();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/donations/public`);
        setDonations(response.data);
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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

      {/* Donations Grid */}
      <section className="py-10 max-w-7xl mx-auto px-[5%]">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tight">Recent Contributions</h2>
            <div className="h-1.5 w-20 bg-primary rounded-full" />
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-black/5">
             <div className="px-6 py-2 bg-primary/5 rounded-xl text-primary font-black text-xs uppercase tracking-widest">
               Total: {donations.length} Verified
             </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-[2.5rem] p-8 h-64 animate-pulse border border-black/5" />
            ))}
          </div>
        ) : donations.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {donations.map((donation) => (
              <motion.div 
                key={donation._id}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group relative bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-black/5 overflow-hidden"
              >
                {/* Decorative Icon Background */}
                <div className="absolute -right-4 -top-4 text-primary/5 group-hover:text-primary/10 transition-colors">
                  <FaHandHoldingHeart size={140} />
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 bg-bg rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                       <FaHandHoldingHeart size={28} />
                    </div>
                    <div className="text-right">
                       <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Amount</span>
                       <span className="text-2xl font-black text-primary">₹{donation.amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Donor Name</span>
                      <h4 className="text-xl font-bold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">{donation.name}</h4>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                       <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                          <FaCalendarAlt className="text-primary/40" />
                          {new Date(donation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                       </div>
                       {donation.locationAddress && (
                         <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                            <FaMapMarkerAlt className="text-primary/40" />
                            <span className="line-clamp-1">{donation.locationAddress}</span>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-black/10">
            <div className="w-20 h-20 bg-bg rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
               <FaDonate size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-400">No recent public records found</h3>
            <p className="text-gray-400 mt-2">Check back soon for new impact reports.</p>
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
