import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import knTranslation from './locales/kn.json';
import teTranslation from './locales/te.json';
import taTranslation from './locales/ta.json';
import mlTranslation from './locales/ml.json';
import hiTranslation from './locales/hi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      kn: { translation: knTranslation },
      te: { translation: teTranslation },
      ta: { translation: taTranslation },
      ml: { translation: mlTranslation },
      hi: { translation: hiTranslation },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
