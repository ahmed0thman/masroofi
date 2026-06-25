import SafeAreaView from '@/components/layout/SafeAreaView';

import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

export default function AnalyticsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="items-center justify-center">
      <Text className="text-3xl font-cairo-bold text-on-surface">{t('analytics.comingSoon')}</Text>
    </SafeAreaView>
  );
}
