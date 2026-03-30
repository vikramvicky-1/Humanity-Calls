import React from "react";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

const DonationsMade = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={t("donations_made.seo_title")}
        description={t("donations_made.seo_desc")}
      />

      <div className="flex flex-col items-center justify-center min-h-[80vh] px-[5%] text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none">
          {t("donations_made.hero_text")}
          <br />
          <span className="text-primary">{t("donations_made.our_members")}</span>
        </h1>
      </div>

      {/* Rest of the page left blank as requested */}
    </div>
  );
};

export default DonationsMade;
