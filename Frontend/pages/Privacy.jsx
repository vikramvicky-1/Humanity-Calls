import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

const Privacy = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white min-h-screen py-24">
      <SEO
        title={t("privacy.title")}
        description="Privacy policy for Humanity Calls NGO."
      />
      <div className="max-w-none mx-auto px-[5%]">
        {/* Back to Home Button - Top */}
        <Link
          to="/"
          className="inline-block mb-8 px-6 py-2 bg-[#B71C1C] text-white rounded-lg hover:bg-red-800 transition-colors"
        >
          ← {t("privacy.back_to_home")}
        </Link>

        <h1 className="text-4xl font-bold mb-8">{t("privacy.title")}</h1>

        <div className="prose prose-red max-w-none">
          <p className="text-sm text-gray-600 mb-8">
            <strong>{t("privacy.last_updated")}</strong>
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.content.intro_title")}</h2>
          <p>{t("privacy.content.intro_para1")}</p>
          <p>{t("privacy.content.intro_para2")}</p>
          <p>{t("privacy.content.intro_para3")}</p>
          <p>{t("privacy.content.intro_para4")}</p>
          <p>{t("privacy.content.intro_para5")}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.content.definitions_title")}</h2>
          <p><strong>{t("privacy.content.definitions_service")}</strong></p>
          <p><strong>{t("privacy.content.definitions_personal_data")}</strong></p>
          <p><strong>{t("privacy.content.definitions_usage_data")}</strong></p>
          <p><strong>{t("privacy.content.definitions_cookies")}</strong></p>
          <p><strong>{t("privacy.content.definitions_controller")}</strong></p>
          <p><strong>{t("privacy.content.definitions_processors")}</strong></p>
          <p><strong>{t("privacy.content.definitions_subject")}</strong></p>
          <p><strong>{t("privacy.content.definitions_user")}</strong></p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.content.info_collection_title")}</h2>
          <p>{t("privacy.content.info_collection_para")}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.content.types_data_title")}</h2>
          <h3 className="text-xl font-bold mt-6 mb-3">{t("privacy.content.personal_data_title")}</h3>
          <p>{t("privacy.content.personal_data_para")}</p>
          <ul className="ml-6 font-bold">
            {t("privacy.content.personal_data_list", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3 className="text-xl font-bold mt-6 mb-3">{t("privacy.content.usage_data_title")}</h3>
          <p>{t("privacy.content.usage_data_para1")}</p>
          <p>{t("privacy.content.usage_data_para2")}</p>

          <h3 className="text-xl font-bold mt-6 mb-3">{t("privacy.content.location_data_title")}</h3>
          <p>{t("privacy.content.location_data_para")}</p>

          <h3 className="text-xl font-bold mt-6 mb-3">{t("privacy.content.cookies_data_title")}</h3>
          <p>{t("privacy.content.cookies_data_para1")}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.content.use_data_title")}</h2>
          <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.content.security_data_title")}</h2>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.content.contact_us_title")}</h2>
          <p>{t("privacy.content.contact_us_para")}</p>
          <p className="mt-4">
            {t("privacy.content.verify_identity_para")}
          </p>
          <p>
            {t("privacy.content.data_protection_authority_para")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("privacy.content.caloppa_title")}
          </h2>
          <p>
            {t("privacy.content.caloppa_para1")}
          </p>
          <p>{t("privacy.content.caloppa_para2")}</p>
          <ul className="ml-6">
            {t("privacy.content.caloppa_list", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3 className="text-xl font-bold mt-6 mb-3">
            {t("privacy.content.do_not_track_title")}
          </h3>
          <p>
            {t("privacy.content.do_not_track_para1")}
          </p>
          <p>
            {t("privacy.content.do_not_track_para2")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("privacy.content.ccpa_title")}
          </h2>
          <p>
            {t("privacy.content.ccpa_para")}
          </p>

          <h3 className="text-xl font-bold mt-6 mb-3">
            {t("privacy.content.ccpa_info_title")}
          </h3>
          <p>{t("privacy.content.ccpa_info_para")}</p>
          <ul className="ml-6">
            {t("privacy.content.ccpa_info_list", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="mt-4">
            {t("privacy.content.ccpa_info_note")}
          </p>

          <h3 className="text-xl font-bold mt-6 mb-3">
            {t("privacy.content.ccpa_delete_title")}
          </h3>
          <p>
            {t("privacy.content.ccpa_delete_para")}
          </p>

          <h3 className="text-xl font-bold mt-6 mb-3">
            {t("privacy.content.ccpa_sell_title")}
          </h3>
          <p>
            {t("privacy.content.ccpa_sell_para1")}
          </p>
          <p>
            {t("privacy.content.ccpa_sell_para2")}
          </p>
          <p>
            {t("privacy.content.ccpa_sell_para3")}
          </p>
          <p>
            {t("privacy.content.ccpa_exercise_rights")}
          </p>
          <p>
            {t("privacy.content.ccpa_footer")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("privacy.content.service_providers_title")}
          </h2>
          <p>
            {t("privacy.content.service_providers_para1")}
          </p>
          <p>
            {t("privacy.content.service_providers_para2")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.content.analytics_title")}</h2>
          <p>
            {t("privacy.content.analytics_para")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.content.cicd_tools_title")}</h2>
          <p>
            {t("privacy.content.cicd_tools_para")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("privacy.content.remarketing_title")}
          </h2>
          <p>
            {t("privacy.content.remarketing_para")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.content.payments_title")}</h2>
          <p>
            {t("privacy.content.payments_para1")}
          </p>
          <p>
            {t("privacy.content.payments_para2")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("privacy.content.links_to_other_sites_title")}
          </h2>
          <p>
            {t("privacy.content.links_to_other_sites_para1")}
          </p>
          <p>
            {t("privacy.content.links_to_other_sites_para2")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("privacy.content.children_privacy_title")}
          </h2>
          <p>
            {t("privacy.content.children_privacy_para1")}
          </p>
          <p>
            {t("privacy.content.children_privacy_para2")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("privacy.content.changes_to_policy_title")}
          </h2>
          <p>
            {t("privacy.content.changes_to_policy_para1")}
          </p>
          <p>
            {t("privacy.content.changes_to_policy_para2")}
          </p>
          <p>
            {t("privacy.content.changes_to_policy_para3")}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.content.contact_us_section_title")}</h2>
          <p>
            {t("privacy.content.contact_us_section_para")} <strong>humanitycallsnotify@gmail.com</strong>
          </p>
        </div>

        {/* Back to Home Button - Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-[#B71C1C] text-white rounded-lg hover:bg-red-800 transition-colors"
          >
            ← {t("privacy.back_to_home")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
