import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

const Terms = () => {
  const { t } = useTranslation();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-white min-h-screen py-24">
      <SEO
        title={t("terms.title")}
        description="Terms and conditions for using Humanity Calls NGO website."
      />
      <div className="max-w-none mx-auto px-[5%]">
        {/* Back to Home Button - Top */}
        <Link
          to="/"
          className="inline-block mb-8 px-6 py-2 bg-[#B71C1C] text-white rounded-lg hover:bg-red-800 transition-colors"
        >
          ← {t("terms.back_to_home")}
        </Link>

        <h1 className="text-4xl font-bold mb-8">{t("terms.title")}</h1>

        <div className="prose prose-red max-w-none">
          <p className="text-sm text-gray-600 mb-8 lowercase">
            {t("terms.last_updated")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.intro_title")}</h2>
          <p className="lowercase">{t("terms.content.intro_para1")}</p>
          <p className="lowercase">{t("terms.content.intro_para2")}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.communications_title")}</h2>
          <p className="lowercase">{t("terms.content.communications_para")}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.prohibited_title")}</h2>
          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.intellectual_property_title")}</h2>
          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.disclaimer_warranty_title")}</h2>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.contact_us_title")}</h2>
          <p className="lowercase">{t("privacy.content.contact_us_para")}</p>
          <p className="lowercase">
            {t("terms.content.lawful_purposes_para")}
          </p>
          <ul className="ml-6 lowercase">
            {t("terms.content.prohibited_list1", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 lowercase">{t("terms.content.additionally_para")}</p>
          <ul className="ml-6 lowercase">
            {t("terms.content.prohibited_list2", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.analytics_title")}</h2>
          <p className="lowercase">
            {t("terms.content.analytics_para")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.no_use_by_minors_title")}</h2>
          <p className="lowercase">
            {t("terms.content.no_use_by_minors_para")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.accounts_title")}</h2>
          <p className="lowercase">
            {t("terms.content.accounts_para1")}
          </p>
          <p className="lowercase">
            {t("terms.content.accounts_para2")}
          </p>
          <p className="lowercase">
            {t("terms.content.accounts_para3")}
          </p>
          <p className="lowercase">
            {t("terms.content.accounts_para4")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("terms.content.intellectual_property_section_title")}
          </h2>
          <p className="lowercase">
            {t("terms.content.intellectual_property_para")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.copyright_policy_title")}</h2>
          <p className="lowercase">
            {t("terms.content.copyright_policy_para1")}
          </p>
          <p className="lowercase">
            {t("terms.content.copyright_policy_para2")}
          </p>
          <p className="lowercase">
            {t("terms.content.copyright_policy_para3")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("terms.content.dmca_title")}
          </h2>
          <p className="lowercase">
            {t("terms.content.dmca_para1")}
          </p>
          <ul className="ml-6 lowercase">
            {t("terms.content.dmca_list", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 lowercase">
            {t("terms.content.dmca_para2")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("terms.content.error_reporting_title")}
          </h2>
          <p className="lowercase">
            {t("terms.content.error_reporting_para")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("terms.content.links_to_other_sites_title")}
          </h2>
          <p className="lowercase">
            {t("terms.content.links_to_other_sites_para1")}
          </p>
          <p className="lowercase">
            {t("terms.content.links_to_other_sites_para2")}
          </p>
          <p className="lowercase">
            {t("terms.content.links_to_other_sites_para3")}
          </p>
          <p className="lowercase">
            {t("terms.content.links_to_other_sites_para4")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("terms.content.disclaimer_of_warranty_section_title")}
          </h2>
          <p className="lowercase">
            {t("terms.content.disclaimer_of_warranty_para1")}
          </p>
          <p className="lowercase">
            {t("terms.content.disclaimer_of_warranty_para2")}
          </p>
          <p className="lowercase">
            {t("terms.content.disclaimer_of_warranty_para3")}
          </p>
          <p className="lowercase">
            {t("terms.content.disclaimer_of_warranty_para4")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("terms.content.limitation_of_liability_title")}
          </h2>
          <p className="lowercase">
            {t("terms.content.limitation_of_liability_para")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.termination_title")}</h2>
          <p className="lowercase">
            {t("terms.content.termination_para1")}
          </p>
          <p className="lowercase">
            {t("terms.content.termination_para2")}
          </p>
          <p className="lowercase">
            {t("terms.content.termination_para3")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.governing_law_title")}</h2>
          <p className="lowercase">
            {t("terms.content.governing_law_para1")}
          </p>
          <p className="lowercase">
            {t("terms.content.governing_law_para2")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.changes_to_service_title")}</h2>
          <p className="lowercase">
            {t("terms.content.changes_to_service_para")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("terms.content.amendments_title")}
          </h2>
          <p className="lowercase">
            {t("terms.content.amendments_para1")}
          </p>
          <p className="lowercase">
            {t("terms.content.amendments_para2")}
          </p>
          <p className="lowercase">
            {t("terms.content.amendments_para3")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("terms.content.waiver_title")}
          </h2>
          <p className="lowercase">
            {t("terms.content.waiver_para1")}
          </p>
          <p className="lowercase">
            {t("terms.content.waiver_para2")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.acknowledgement_title")}</h2>
          <p className="lowercase">
            {t("terms.content.acknowledgement_para")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.content.contact_us_section_title")}</h2>
          <p className="lowercase">
            {t("terms.content.contact_us_section_para")} humanitycalls20@gmail.com
          </p>
        </div>

        {/* Back to Home Button - Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-[#B71C1C] text-white rounded-lg hover:bg-red-800 transition-colors"
          >
            ← {t("terms.back_to_home")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
