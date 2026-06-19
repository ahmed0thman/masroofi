import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import i18n from '../i18n';

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

i18n.on('languageChanged', (lang: string) => {
  const isRTL = RTL_LANGUAGES.includes(lang);

  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    // Restart the app to apply the layout direction change
    Updates.reloadAsync();
  }
});
