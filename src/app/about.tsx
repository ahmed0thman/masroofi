import SafeAreaView from '@/components/layout/SafeAreaView';
import { useThemeColors } from '@/styles/global';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, I18nManager, Pressable, Text, View } from 'react-native';
import { useProfile } from '@/hooks/useProfile';

export default function About() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTester = profile?.user_type === 'tester' || profile?.user_type === 'admin';

  const handleVersionTap = useCallback(() => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);

    if (tapCountRef.current >= 7) {
      tapCountRef.current = 0;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      updateProfile({ user_type: 'tester' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('settings.about.testerMode' as any),
        t('settings.about.testerEnabled' as any),
      );
    }
  }, [updateProfile, t]);

  const handleRevertToUser = useCallback(() => {
    updateProfile({ user_type: 'user' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      t('settings.about.testerMode' as any),
      t('settings.about.testerDisabled' as any),
    );
  }, [updateProfile, t]);

  return (
    <SafeAreaView className="bg-background flex-1 p-0">
      <View className="flex-1 px-5 pt-4">
        <View className="flex-row items-center gap-3 mb-8">
          <Pressable onPress={() => router.back()}>
            <Ionicons
              style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
              name="chevron-back"
              size={24}
              color={colors.onSurface}
            />
          </Pressable>
          <Text className="text-2xl font-cairo-bold text-on-surface">{t('settings.about')}</Text>
        </View>

        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-secondary-container/30 items-center justify-center mb-4">
            <Ionicons name="wallet-outline" size={40} color={colors.secondary} />
          </View>
          <Text className="text-2xl font-cairo-bold text-on-surface">{t('common.appName')}</Text>
          <Pressable onPress={handleVersionTap} className="mt-2 mb-2">
            <Text className="text-muted-foreground font-cairo">
              {t('settings.about.version', { version: '0.0.1' })}
            </Text>
          </Pressable>
          <Text className="text-sm text-muted-foreground font-cairo mt-1">
            {t('settings.about.madeIn')}
          </Text>
        </View>

        {isTester && (
          <View className="bg-primary-container/20 rounded-[20px] p-4 mb-6 items-center gap-3">
            <Ionicons name="flask" size={24} color={colors.secondary} />
            <Text className="text-on-surface font-cairo-bold text-base">{t('settings.about.testerMode' as any)}</Text>
            <Pressable
              className="bg-primary rounded-xl py-2.5 px-6"
              onPress={handleRevertToUser}
            >
              <Text className="text-on-primary font-cairo-semibold text-sm">
                {t('settings.about.revertToUser' as any)}
              </Text>
            </Pressable>
          </View>
        )}

        <View className="bg-surface-bright rounded-[20px] overflow-hidden">
          <Pressable onPress={() => {}}>
            <View className="px-4 py-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Ionicons name="shield-checkmark-outline" size={22} color={colors.secondary} />
                <Text className="text-on-surface font-cairo">{t('settings.about.privacy')}</Text>
              </View>
              <Ionicons
                style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
                name="chevron-forward"
                size={18}
                color={colors.onSurfaceVariant}
              />
            </View>
          </Pressable>
          <View className="border-b border-outline-variant ml-14" />
          <Pressable onPress={() => {}}>
            <View className="px-4 py-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Ionicons name="mail-outline" size={22} color={colors.secondary} />
                <Text className="text-on-surface font-cairo">{t('settings.about.contact')}</Text>
              </View>
              <Ionicons
                style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
                name="chevron-forward"
                size={18}
                color={colors.onSurfaceVariant}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
