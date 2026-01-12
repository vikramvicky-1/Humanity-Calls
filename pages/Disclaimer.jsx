import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

const Disclaimer = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white min-h-screen py-24">
      <SEO
        title={t("disclaimer.title")}
        description="Disclaimer for Humanity Calls NGO."
      />
      <div className="max-w-none mx-auto px-[5%]">
        {/* Back to Home Button - Top */}
        <Link
          to="/"
          className="inline-block mb-8 px-6 py-2 bg-[#B71C1C] text-white rounded-lg hover:bg-red-800 transition-colors"
        >
          ← {t("disclaimer.back_to_home")}
        </Link>

        <h1 className="text-4xl font-bold mb-8">{t("disclaimer.title")}</h1>

        <div className="prose prose-red max-w-none">
          <p className="text-sm text-gray-600 mb-8">
            <strong>{t("disclaimer.last_updated")}</strong>
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("disclaimer.content.gen_info_title")}</h2>
          <p>{t("disclaimer.content.gen_info_para1")}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("disclaimer.content.ext_links_title")}</h2>
          <p>{t("disclaimer.content.ext_links_para1")}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("disclaimer.content.prof_disclaimer_title")}</h2>
          <p>{t("disclaimer.content.prof_disclaimer_para1")}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("disclaimer.content.testimonials_title")}</h2>
          <p>{t("disclaimer.content.testimonials_para1")}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("disclaimer.content.contact_us_title")}</h2>
          <p>{t("disclaimer.content.contact_us_para")}</p>
        </div>

        {/* Back to Home Button - Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-[#B71C1C] text-white rounded-lg hover:bg-red-800 transition-colors"
          >
            ← {t("disclaimer.back_to_home")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
