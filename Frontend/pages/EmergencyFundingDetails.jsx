import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import SEO from "../components/SEO";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";
import {
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
  FaWhatsapp,
  FaFacebookF,
  FaTelegramPlane,
  FaTwitter,
  FaLink,
  FaDownload,
  FaPhone,
  FaEnvelope,
  FaUniversity,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import { buildEmergencyShareUrls, copyEmergencyLink } from "../utils/emergencyShare";
import { parseVideoForEmbed } from "../utils/emergencyVideoEmbed";
import { downloadEmergencyBannerPng } from "../utils/downloadEmergencyBanner";
import { API_URL } from "../utils/apiConfig.js";
import { createPortal } from "react-dom";
import { FaCloudUploadAlt, FaTrashAlt, FaHandHoldingHeart } from "react-icons/fa";
import { uploadPublicImage } from "../utils/publicForms";
import { motion, AnimatePresence } from "framer-motion";

const EmergencyFundingDetails = () => {
  const { slug } = useParams();
  const [f, setF] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carousel, setCarousel] = useState(0);
  const [bannerBusy, setBannerBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/emergency-fundraisers/public/slug/${slug}`)
      .then((res) => {
        const payload = res?.data;
        const ok =
          payload &&
          typeof payload === "object" &&
          !Array.isArray(payload) &&
          (payload._id || payload.slug);
        setF(ok ? payload : null);
      })
      .catch(() => {
        setF(null);
        toast.error("Fundraiser not found");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const pageUrl = typeof window !== "undefined" && f ? f.shareLink || `${window.location.origin}/emergency-funding/${f.slug}` : "";

  const handleBanner = async () => {
    if (!f) return;
    setBannerBusy(true);
    try {
      await downloadEmergencyBannerPng({
        patientImageUrl: f.photos?.[0] || f.bannerImage,
        title: f.title,
        patientName: f.patientName,
        targetAmount: f.targetAmount,
        raisedAmount: f.raisedAmount,
        pendingAmount: f.pendingAmount,
        qrImageUrl: f.qrCodeImage,
        filename: `HC-emergency-${f.slug}.png`,
      });
      toast.success("Banner downloaded");
    } catch {
      toast.error("Could not generate banner (try disabling strict blockers)");
    } finally {
      setBannerBusy(false);
    }
  };

  const [donationModal, setDonationModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    transactionId: "",
  });

  const onDonationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.warning("Please upload payment screenshot");
    setSubmitting(true);
    try {
      const screenshotUrl = await uploadPublicImage(selectedFile);
      await axios.post(`${API_URL}/emergency-donations/submit`, {
        ...form,
        fundraiserId: f._id,
        screenshotUrl,
      });
      setShowThankYou(true);
      setDonationModal(false);
      setForm({ name: "", email: "", phone: "", amount: "", transactionId: "" });
      setSelectedFile(null);
      setPreviewUrl("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!f) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#fafafa]">
        <SEO title="Not found | Humanity Calls" />
        <p className="text-lg font-black text-text-body">This fundraiser is not available.</p>
        <Link to="/emergency-funding" className="mt-6 text-primary font-bold underline">
          Back to all campaigns
        </Link>
      </div>
    );
  }

  const photos = f.photos?.length ? f.photos : f.bannerImage ? [f.bannerImage] : [];
  const video = parseVideoForEmbed(f.videoUrl);
  const shareUrls = buildEmergencyShareUrls({
    pageUrl,
    title: f.title,
    summary: f.shortDescription,
  });
  const pct = f.progressPercentage ?? 0;
  const pending = f.pendingAmount ?? Math.max(0, (f.targetAmount || 0) - (f.raisedAmount || 0));
  const bd = f.bankDetails || {};
  const cd = f.contactDetails || {};

  return (
    <div className="min-h-screen bg-[#f4f6fb] pb-20">
      <SEO 
        title={`${f.title} | Emergency Funding`} 
        description={f.shortDescription || f.title}
        image={photos[0]}
      />

      <div className="bg-white border-b border-black/5">
        <div className="max-w-6xl mx-auto px-[5%] py-4 flex items-center gap-4">
          <Link to="/emergency-funding" className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
            ← All campaigns
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-[5%] pt-8 md:pt-12 grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
        <div className="space-y-8">
          {photos.length > 0 ? (
            <div className="relative rounded-[2rem] overflow-hidden bg-black shadow-xl border border-black/5 aspect-[16/10] max-h-[480px]">
              <img src={photos[carousel % photos.length]} alt="" className="w-full h-full object-contain bg-black" />
              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => setCarousel((c) => (c - 1 + photos.length) % photos.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 text-[#1a1a2e] shadow-lg hover:bg-white"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => setCarousel((c) => (c + 1) % photos.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 text-[#1a1a2e] shadow-lg hover:bg-white"
                  >
                    <FaChevronRight />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCarousel(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === carousel % photos.length ? "bg-white w-6" : "bg-white/40"}`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {video ? (
            <div className="rounded-[2rem] overflow-hidden border border-black/8 bg-black shadow-lg aspect-video">
              {video.type === "youtube" ? (
                <iframe title="Campaign video" src={video.src} className="w-full h-full min-h-[220px] md:min-h-[400px]" allowFullScreen />
              ) : (
                <video src={video.src} controls className="w-full h-full" playsInline />
              )}
            </div>
          ) : null}

          <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-black/6 shadow-sm">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-blood/10 text-blood text-[10px] font-black uppercase tracking-widest">
                Verified emergency
              </span>
              {f.goalReached ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <FaCheckCircle /> Goal reached
                </span>
              ) : null}
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-[#1a1a1a] leading-tight tracking-tight">{f.title}</h1>
            {f.patientName ? (
              <p className="mt-2 text-sm font-bold text-text-body/50 uppercase tracking-widest">For {f.patientName}</p>
            ) : null}

            {f.fullDescription ? (
              <div className="mt-8 prose prose-sm max-w-none text-text-body/80 whitespace-pre-wrap leading-relaxed">
                {f.fullDescription}
              </div>
            ) : (
              <p className="mt-6 text-text-body/70 leading-relaxed">{f.shortDescription}</p>
            )}

            <div className="mt-10 grid sm:grid-cols-2 gap-4 text-sm">
              {f.medicalCondition ? (
                <div className="p-4 rounded-2xl bg-bg border border-border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Medical condition</p>
                  <p className="font-bold text-text-body">{f.medicalCondition}</p>
                </div>
              ) : null}
              {f.hospitalName ? (
                <div className="p-4 rounded-2xl bg-bg border border-border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Hospital</p>
                  <p className="font-bold text-text-body">{f.hospitalName}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={shareUrls.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-sm">
              <FaWhatsapp size={18} /> WhatsApp
            </a>
            <a href={shareUrls.twitter} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white font-bold text-sm">
              <FaTwitter size={16} /> X / Twitter
            </a>
            <a href={shareUrls.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] text-white font-bold text-sm">
              <FaFacebookF size={16} /> Facebook
            </a>
            <a href={shareUrls.telegram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0088cc] text-white font-bold text-sm">
              <FaTelegramPlane size={18} /> Telegram
            </a>
            <button
              type="button"
              onClick={async () => {
                const ok = await copyEmergencyLink(pageUrl);
                toast[ok ? "success" : "error"](ok ? "Link copied" : "Copy failed");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-border font-bold text-sm hover:border-primary"
            >
              <FaLink /> Copy link
            </button>
            <button
              type="button"
              disabled={bannerBusy}
              onClick={handleBanner}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50"
            >
              <FaDownload /> Download banner
            </button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-black/6 shadow-xl shadow-primary/5">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-6 flex items-center gap-2">
              <FaUniversity /> Donate now
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between font-black text-lg">
                <span className="text-text-body/50 text-xs uppercase tracking-widest self-center">Raised</span>
                <span className="text-primary">₹{(f.raisedAmount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-text-body/50">Goal</span>
                <span>₹{(f.targetAmount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-bold text-blood">
                <span className="text-text-body/50">Pending</span>
                <span>₹{pending.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-3 rounded-full bg-black/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${f.goalReached ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-blood"}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <p className="text-center text-xs font-black text-text-body/50">{pct}% funded · {f.supportersCount || 0} supporters</p>
            </div>

            {f.qrCodeImage ? (
              <div className="mt-6 flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-body/40 mb-2">Scan UPI / QR</p>
                <div className="p-3 bg-white rounded-2xl border border-border inline-block">
                  <img src={f.qrCodeImage} alt="Donation QR" className="w-40 h-40 object-contain" />
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-body/40 mb-2">Share this page</p>
                <div className="p-3 bg-white rounded-2xl border border-border">
                  <QRCode value={pageUrl} size={140} level="M" />
                </div>
              </div>
            )}

            <div className="mt-8 space-y-3 text-xs border-t border-border pt-6">
              {bd.accountHolderName ? (
                <p>
                  <span className="font-black text-text-body/40 uppercase tracking-wider block mb-0.5">Account name</span>
                  <span className="font-bold text-text-body">{bd.accountHolderName}</span>
                </p>
              ) : null}
              {bd.bankName ? (
                <p>
                  <span className="font-black text-text-body/40 uppercase tracking-wider block mb-0.5">Bank</span>
                  <span className="font-bold text-text-body">{bd.bankName}</span>
                </p>
              ) : null}
              {bd.accountNumber ? (
                <p>
                  <span className="font-black text-text-body/40 uppercase tracking-wider block mb-0.5">Account number</span>
                  <span className="font-bold text-text-body tracking-wide select-all">{bd.accountNumber}</span>
                </p>
              ) : null}
              {bd.ifscCode ? (
                <p>
                  <span className="font-black text-text-body/40 uppercase tracking-wider block mb-0.5">IFSC</span>
                  <span className="font-bold text-text-body select-all">{bd.ifscCode}</span>
                </p>
              ) : null}
              {bd.upiId ? (
                <p>
                  <span className="font-black text-text-body/40 uppercase tracking-wider block mb-0.5">UPI ID</span>
                  <span className="font-bold text-primary select-all">{bd.upiId}</span>
                </p>
              ) : null}
            </div>

            <a
              href={`tel:${String(cd.phone || "").replace(/\D/g, "")}`}
              className="mt-8 block w-full py-4 rounded-xl bg-[#1a1a2e] text-white text-center font-black text-sm uppercase tracking-widest hover:bg-primary transition-colors"
            >
              Contact coordinator
            </a>

            <button
              onClick={() => setDonationModal(true)}
              className="mt-3 block w-full py-4 rounded-xl bg-primary text-white text-center font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Submit Donation Details
            </button>

            <div className="mt-6 space-y-2 text-xs text-text-body/70">
              {cd.phone ? (
                <p className="flex items-center gap-2 font-bold">
                  <FaPhone className="text-primary" /> {cd.phone}
                </p>
              ) : null}
              {cd.alternatePhone ? (
                <p className="flex items-center gap-2 font-bold">
                  <FaPhone className="text-primary/60" /> {cd.alternatePhone}
                </p>
              ) : null}
              {cd.email ? (
                <p className="flex items-center gap-2 font-bold break-all">
                  <FaEnvelope className="text-primary shrink-0" /> {cd.email}
                </p>
              ) : null}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-blood/10 rounded-[2rem] p-6 border border-primary/15 text-center">
            <FaHeart className="mx-auto text-primary text-2xl mb-2" />
            <p className="text-sm font-bold text-text-body leading-relaxed">
              100% of your kindness supports verified medical care. Thank you for trusting Humanity Calls.
            </p>
          </div>
        </aside>
      </div>

      {donationModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setDonationModal(false)}>
          <div 
            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-primary/5 flex items-center justify-between bg-primary/5 shrink-0">
              <div>
                <h3 className="text-xl font-black text-primary">Report Donation</h3>
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Verify your contribution</p>
              </div>
              <button onClick={() => setDonationModal(false)} className="p-3 bg-white hover:bg-bg rounded-2xl shadow-sm transition-all text-primary/40 hover:text-primary">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-10 overflow-y-auto flex-grow min-h-0 custom-scrollbar bg-white" style={{ overscrollBehavior: 'contain' }} data-lenis-prevent>
              <form id="emergency-donation-form" onSubmit={onDonationSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Full Name</label>
                    <input required className="w-full px-5 py-4 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Email</label>
                    <input required type="email" className="w-full px-5 py-4 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Phone</label>
                    <input required className="w-full px-5 py-4 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Amount (₹)</label>
                    <input required type="number" min={1} className="w-full px-5 py-4 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Transaction ID</label>
                  <input required className="w-full px-5 py-4 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm" value={form.transactionId} onChange={(e) => setForm(p => ({ ...p, transactionId: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Payment Screenshot</label>
                  {!previewUrl ? (
                    <label className="relative group block cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) { setSelectedFile(f); setPreviewUrl(URL.createObjectURL(f)); }
                      }} />
                      <div className="w-full py-10 px-4 border-2 border-dashed border-border bg-bg/50 rounded-3xl flex flex-col items-center justify-center gap-2 group-hover:border-primary group-hover:bg-primary/5 transition-all">
                        <div className="w-12 h-12 bg-white text-primary shadow-sm rounded-xl flex items-center justify-center"><FaCloudUploadAlt size={24} /></div>
                        <p className="text-sm font-bold text-text-body">Click to upload screenshot</p>
                        <p className="text-[10px] text-text-body/40 font-black uppercase tracking-widest">PNG, JPG up to 8MB</p>
                      </div>
                    </label>
                  ) : (
                    <div className="relative rounded-[2rem] overflow-hidden border border-border shadow-sm group aspect-video">
                      <img src={previewUrl} alt="Proof" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(""); }} className="w-12 h-12 rounded-full bg-blood text-white flex items-center justify-center hover:scale-110 transition-all">
                          <FaTrashAlt size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="p-8 bg-primary/5 border-t border-primary/5 flex items-center justify-end gap-4 shrink-0">
              <button onClick={() => setDonationModal(false)} className="px-8 py-4 text-primary/40 hover:text-primary font-black text-xs uppercase tracking-widest transition-all">
                Cancel
              </button>
              <button 
                form="emergency-donation-form"
                disabled={submitting}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Send Verification Request"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Thank You Popup */}
      <AnimatePresence>
        {showThankYou && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-blood to-primary" />
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <FaCheckCircle size={40} className="animate-bounce" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Donation Reported! ❤️</h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-8">
                Thank you for your support. Our team will verify the transaction and update the fundraiser totals shortly.
              </p>
              <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                  <FaHandHoldingHeart size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-primary uppercase tracking-widest leading-none mb-1">Impact Status</p>
                  <p className="text-sm font-bold text-slate-700">Verification in progress...</p>
                </div>
              </div>
              <button
                onClick={() => setShowThankYou(false)}
                className="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyFundingDetails;
