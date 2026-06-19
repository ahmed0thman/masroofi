import 'i18next';
import type ar from './locales/ar/translations.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof ar;
    };
  }
}
