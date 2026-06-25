import { View, Pressable, Text } from 'react-native';
import React, { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomSheet } from '@/components/BottomSheet';
import { SettingsRow } from '@/components/SettingsRow';
import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import Container from '../layout/container';

export function AppSettingsSection() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const [activeSheet, setActiveSheet] = useState<'language' | 'theme' | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('ar');
  const [selectedTheme, setSelectedTheme] = useState('system');

  const closeSheet = useCallback(() => {
    setActiveSheet(null);
  }, []);

  const openLanguageSheet = useCallback(() => {
    setSelectedLanguage(profile?.language ?? 'ar');
    setActiveSheet('language');
  }, [profile?.language]);

  const openThemeSheet = useCallback(() => {
    setSelectedTheme(profile?.theme ?? 'system');
    setActiveSheet('theme');
  }, [profile?.theme]);

  const handleAbout = useCallback(() => {
    router.push('/about');
  }, [router]);

  const handleLanguageSave = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateProfile({ language: selectedLanguage });
    await i18n.changeLanguage(selectedLanguage);
    setActiveSheet(null);
  }, [selectedLanguage, updateProfile, i18n]);

  const handleThemeSave = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateProfile({ theme: selectedTheme });
    setActiveSheet(null);
  }, [selectedTheme, updateProfile]);

  const getLanguageValue = () => {
    const lang = profile?.language ?? 'ar';
    return lang === 'ar' ? t('onboarding.language.ar') : t('onboarding.language.en');
  };

  const getThemeValue = () => {
    const theme = profile?.theme ?? 'system';
    return t(`settings.theme.${theme}` as any);
  };

  return (
    <>
      <Container>
        <Text className="section-title">{t('home.settings.title')}</Text>
      </Container>
      <View className="bg-surface-bright rounded-[20px] mx-5 overflow-hidden">
        <SettingsRow
          icon="language-outline"
          label={t('settings.language')}
          value={getLanguageValue()}
          onPress={openLanguageSheet}
        />
        <SettingsRow
          icon="color-palette-outline"
          label={t('settings.theme')}
          value={getThemeValue()}
          onPress={openThemeSheet}
        />
        <SettingsRow
          icon="information-circle-outline"
          label={t('settings.about')}
          onPress={handleAbout}
          isLast
        />
      </View>

      <BottomSheet
        visible={activeSheet === 'language'}
        onClose={closeSheet}
        title={t('settings.language')}
      >
        <Pressable
          className="flex-row items-center justify-between px-4 py-3 rounded-xl"
          onPress={() => setSelectedLanguage('ar')}
        >
          <Text className="text-on-surface font-cairo">{t('onboarding.language.ar')}</Text>
          {selectedLanguage === 'ar' ? (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          ) : null}
        </Pressable>
        <Pressable
          className="flex-row items-center justify-between px-4 py-3 rounded-xl"
          onPress={() => setSelectedLanguage('en')}
        >
          <Text className="text-on-surface font-cairo">{t('onboarding.language.en')}</Text>
          {selectedLanguage === 'en' ? (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          ) : null}
        </Pressable>
        <View className="flex-row gap-3 mt-6">
          <Pressable
            className="flex-1 py-3 rounded-xl bg-surface-container-high items-center"
            onPress={closeSheet}
          >
            <Text className="text-on-surface font-cairo">{t('common.cancel')}</Text>
          </Pressable>
          <Pressable
            className="flex-1 py-3 rounded-xl bg-primary items-center"
            onPress={handleLanguageSave}
          >
            <Text className="text-on-primary font-cairo-semibold">{t('common.save')}</Text>
          </Pressable>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={activeSheet === 'theme'}
        onClose={closeSheet}
        title={t('settings.theme')}
      >
        {(['light', 'dark', 'system'] as const).map((themeOption) => (
          <Pressable
            key={themeOption}
            className="flex-row items-center justify-between px-4 py-3 rounded-xl"
            onPress={() => setSelectedTheme(themeOption)}
          >
            <Text
              className={`font-cairo ${
                selectedTheme === themeOption ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {t(`settings.theme.${themeOption}` as any)}
            </Text>
            {selectedTheme === themeOption ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            ) : (
              <View className="w-6 h-6 rounded-full border-2 border-outline-variant" />
            )}
          </Pressable>
        ))}
        <View className="flex-row gap-3 mt-6">
          <Pressable
            className="flex-1 py-3 rounded-xl bg-surface-container-high items-center"
            onPress={closeSheet}
          >
            <Text className="text-on-surface font-cairo">{t('common.cancel')}</Text>
          </Pressable>
          <Pressable
            className="flex-1 py-3 rounded-xl bg-primary items-center"
            onPress={handleThemeSave}
          >
            <Text className="text-on-primary font-cairo-semibold">{t('common.save')}</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </>
  );
}
