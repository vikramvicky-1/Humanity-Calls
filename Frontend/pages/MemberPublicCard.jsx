import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SEO from "../components/SEO";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";

const MemberPublicCard = () => {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${import.meta.env.VITE_API_URL}/member-public/card/${userId}`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          toast.error("This profile could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleEmergency = async () => {
    setSending(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/member-public/emergency`, { userId });
      toast.success("Thank you. Our team has been notified.");
    } catch {
      toast.error("Could not send the alert. If this is urgent, please call local emergency services.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-6 text-center">
        <SEO title="Member card | Humanity Calls" />
        <p className="text-text-body font-bold text-lg">Profile not available.</p>
      </div>
    );
  }

  const v = data.volunteer;
  const cardUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 py-10 px-4 pb-24">
      <SEO
        title={`${v?.fullName || data.accountName || "Member"} | Humanity Calls`}
        description="Official Humanity Calls member information for emergencies and verification."
      />

      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none">
          <div className="bg-gradient-to-r from-primary to-blood px-8 py-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] opacity-90">Humanity Calls Trust</p>
            <h1 className="text-2xl font-black mt-1 tracking-tight">Member information card</h1>
            <p className="text-sm font-medium text-white/85 mt-1">For verification & emergency contact</p>
          </div>

          <div className="p-8 space-y-8">
            {v?.profilePicture ? (
              <div className="flex justify-center">
                <img
                  src={v.profilePicture}
                  alt=""
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-slate-100 shadow-md"
                />
              </div>
            ) : null}

            <section className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 space-y-3">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Registered member</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-text-body/50 font-bold">Name</dt>
                  <dd className="font-black text-text-body text-right">{v?.fullName || data.accountName}</dd>
                </div>
                {v?.volunteerId ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-body/50 font-bold">Volunteer ID</dt>
                    <dd className="font-bold text-primary text-right">{v.volunteerId}</dd>
                  </div>
                ) : null}
                {v?.bloodGroup ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-body/50 font-bold">Blood group</dt>
                    <dd className="font-bold text-blood text-right">{v.bloodGroup}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="text-text-body/50 font-bold">Phone</dt>
                  <dd className="font-bold text-right break-all">{v?.phone || data.accountPhone || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-body/50 font-bold">Email</dt>
                  <dd className="font-bold text-right break-all text-xs">{v?.email || data.accountEmail}</dd>
                </div>
                {v?.emergencyContact ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-body/50 font-bold">Emergency / family</dt>
                    <dd className="font-bold text-right">{v.emergencyContact}</dd>
                  </div>
                ) : null}
                {v?.referredByName ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-body/50 font-bold">Referred by</dt>
                    <dd className="font-bold text-primary/80 text-right">{v.referredByName}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            {data.coordinator?.name ? (
              <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 space-y-2">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800">Coordinator</h2>
                <p className="font-black text-text-body">{data.coordinator.name}</p>
                {data.coordinator.phone ? (
                  <p className="text-sm font-bold text-text-body/80">Phone: {data.coordinator.phone}</p>
                ) : null}
                {data.coordinator.email ? (
                  <p className="text-xs font-bold text-text-body/70 break-all">{data.coordinator.email}</p>
                ) : null}
              </section>
            ) : null}

            {!v ? (
              <p className="text-sm text-text-body/70 font-medium text-center">
                This account is registered with Humanity Calls. Full volunteer details appear once membership is active.
              </p>
            ) : null}

            <div className="flex flex-col items-center gap-3 pt-2 border-t border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-body/40">Scan to save this card</p>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-inner">
                <QRCode value={cardUrl} size={128} level="M" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border-2 border-red-200 bg-red-50 p-6 text-center shadow-lg">
          <h3 className="text-lg font-black text-red-900 mb-2">Emergency</h3>
          <p className="text-sm text-red-900/80 font-medium mb-5 leading-relaxed">
            If this person needs urgent help, press the button below. Humanity Calls admin will be emailed immediately.
          </p>
          <button
            type="button"
            disabled={sending}
            onClick={handleEmergency}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-red-600/30 disabled:opacity-60 transition-colors"
          >
            {sending ? "Sending…" : "Notify family & admin now"}
          </button>
          <p className="text-[11px] text-red-800/70 mt-4 font-bold">
            Life-threatening emergencies: call your local emergency number first.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberPublicCard;
