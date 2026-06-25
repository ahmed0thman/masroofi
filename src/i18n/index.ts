import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { resources } from './locales';

import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

i18n.on('languageChanged', (lang: string) => {
  const isRTL = RTL_LANGUAGES.includes(lang);

  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    Updates.reloadAsync();
  }
});

const LANGUAGE_STORAGE_KEY = 'app.language';

const lnaguageDetector = {
  type: 'languageDetector' as const,
  async: true,
  init: () => {},
  detect: async (callback: (lang: string) => void) => {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage) {
        callback(storedLanguage);
        return;
      }
    } catch (e) {
      // sliently fail and fallback to device language
    }

    const deviceLanguage = getLocales()[0]?.languageCode ?? 'ar';
    callback(deviceLanguage);
  },
  cacheUserLanguage: async (lang: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      // sliently fail
    }
  },
};

i18n
  .use(lnaguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
