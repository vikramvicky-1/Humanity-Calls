import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const BloodForms = () => {
  return (
    <div className="bg-bg min-h-screen py-24">
      <SEO
        title="Blood Forms | Humanity Calls"
        description="Donate blood pledge or request blood donors. Choose the form you need."
      />

      <div className="max-w-5xl mx-auto px-[5%]">
        <h1 className="text-4xl md:text-5xl font-black text-blood mb-4">
          Blood Forms
        </h1>
        <p className="text-text-body/70 mb-10 max-w-2xl">
          Choose what you need right now: pledge to donate blood, or request donors for an emergency.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/blood-donation"
            className="group bg-white rounded-3xl border border-border shadow-xl p-8 hover:-translate-y-1 transition-all"
          >
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blood mb-3">
              Donate Now
            </div>
            <h2 className="text-2xl font-black text-text-body mb-2">
              Blood Donation Pledge
            </h2>
            <p className="text-text-body/60">
              Share your details so we can reach you quickly when blood is needed.
            </p>
          </Link>

          <Link
            to="/request-donors"
            className="group bg-white rounded-3xl border border-border shadow-xl p-8 hover:-translate-y-1 transition-all"
          >
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blood mb-3">
              Request Blood
            </div>
            <h2 className="text-2xl font-black text-text-body mb-2">
              Find Blood Donors
            </h2>
            <p className="text-text-body/60">
              Submit patient and hospital details so our admin team can coordinate donors.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BloodForms;

