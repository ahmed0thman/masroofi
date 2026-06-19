import SafeAreaView from '@/components/layout/SafeAreaView';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';

const SplashScreen = () => {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="bg-[#1b1c1a] flex-center font-cairo">
      <View className="flex-col gap-4 items-center">
        <View
          className="bg-primary-container rounded-full w-24 h-24 flex-center"
          style={{
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10)',
          }}
        >
          <Image source={require('@/assets/images/Icon.png')} className="w-10 h-10" />
        </View>
        <View className="flex-col items-center gap-3">
          <Text className="text-4xl text-primary leading-tight font-cairo-bold">
            {t('common.appName')}
          </Text>
          <Text className="text-lg font-cairo text-foreground">
            {t('common.recordYourExpenses')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;
