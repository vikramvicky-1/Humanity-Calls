import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import Button from '../components/Button';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-[5%] text-center">
      <h1 className="text-9xl font-bold text-[#B71C1C]">404</h1>
      <h2 className="text-3xl font-semibold mt-4 text-[#1A1A1A]">{t("not_found.title")}</h2>
      <p className="text-[#4A4A4A] mt-2 mb-8">
        {t("not_found.description")}
      </p>
      <Link to="/">
        <Button className="px-8 py-3">
          {t("not_found.back_home")}
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
