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
} from "react-icons/fa";
import { buildEmergencyShareUrls, copyEmergencyLink } from "../utils/emergencyShare";
import { parseVideoForEmbed } from "../utils/emergencyVideoEmbed";
import { downloadEmergencyBannerPng } from "../utils/downloadEmergencyBanner";
import { API_URL } from "../utils/apiConfig.js";

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
      <SEO title={`${f.title} | Emergency Funding`} description={f.shortDescription || f.title} />

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
    </div>
  );
};

export default EmergencyFundingDetails;
