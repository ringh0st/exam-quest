import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  defaultLanguage,
  isSupportedLanguage,
  resources,
  type SupportedLanguage,
} from './resources';

/** Picks the first of the device's preferred languages that the app supports. */
export function pickLanguage(deviceLanguages: readonly (string | null)[]): SupportedLanguage {
  return deviceLanguages.find(isSupportedLanguage) ?? defaultLanguage;
}

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: pickLanguage(getLocales().map((locale) => locale.languageCode)),
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
});

export default i18n;
