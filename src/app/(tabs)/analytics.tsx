import SafeAreaView from '@/components/layout/SafeAreaView';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';

export default function AnalyticsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="items-center justify-center">
      <Text className="text-3xl font-cairo-bold text-on-surface">
        {t('analytics.comingSoon')}
      </Text>
    </SafeAreaView>
  );
}
