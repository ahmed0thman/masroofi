import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useThemeColors } from '@/styles/global';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function AppSettingsSection() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const handleLanguageChange = useCallback(
    async (lang: string) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateProfile({ language: lang });
      await i18n.changeLanguage(lang);
    },
    [updateProfile, i18n],
  );

  const handleThemeChange = useCallback(
    async (theme: string) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateProfile({ theme });
    },
    [updateProfile],
  );

  const handleAbout = useCallback(() => {
    router.push('/about');
  }, [router]);

  const languageOptions = [
    { label: t('onboarding.language.ar'), value: 'ar' },
    { label: t('onboarding.language.en'), value: 'en' },
  ];

  return (
    <View className="flex-col gap-6 mb-8">
      <Text className="section-title">{t('home.settings.title')}</Text>

      <View className="bg-surface-container rounded-3xl p-6 gap-8 shadow-sm">
        {/* Language Setting */}
        <View className="flex-col gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="language-outline" size={20} color={colors.secondary} />
            <Text className="font-cairo-semibold text-on-surface">{t('settings.language')}</Text>
          </View>
          <Select
            options={languageOptions}
            value={profile?.language ?? 'ar'}
            onValueChange={handleLanguageChange}
            className="bg-surface-container-low border-outline-variant"
          />
        </View>

        {/* Theme Setting */}
        <View className="flex-col gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="color-palette-outline" size={20} color={colors.secondary} />
            <Text className="font-cairo-semibold text-on-surface">{t('settings.theme')}</Text>
          </View>
          <View className="bg-surface-container-low rounded-full p-1 flex-row items-center">
            {(['light', 'dark', 'system'] as const).map((theme) => {
              const themeLabel = theme === 'light'
                ? t('settings.theme.light')
                : theme === 'dark'
                  ? t('settings.theme.dark')
                  : t('settings.theme.system');
              return (
                <Button
                  key={theme}
                  variant={profile?.theme === theme ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1 rounded-full py-1 px-2"
                  onPress={() => handleThemeChange(theme)}
                >
                  {themeLabel}
                </Button>
              );
            })}
          </View>
        </View>

        {/* About Setting */}
        <TouchableOpacity
          onPress={handleAbout}
          className="flex-row items-center justify-between p-4 rounded-2xl bg-surface-container-low active:bg-surface-container-high"
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="information-circle-outline" size={20} color={colors.secondary} />
            <Text className="font-cairo-medium text-on-surface">{t('settings.about')}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
