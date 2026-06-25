import { View, Pressable } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import SafeAreaView from '@/components/layout/SafeAreaView';

export default function About() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView className="bg-background flex-1 p-0">
      <View className="flex-1 px-5 pt-4">
        <View className="flex-row items-center gap-3 mb-8">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </Pressable>
          <Text className="text-2xl font-cairo-bold text-on-surface">
            {t('settings.about')}
          </Text>
        </View>

        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
            <Ionicons name="wallet-outline" size={40} color={colors.primary} />
          </View>
          <Text className="text-2xl font-cairo-bold text-on-surface">
            {t('common.appName')}
          </Text>
          <Text className="text-sm text-muted-foreground font-cairo mt-1">
            {t('settings.about.version', { version: '1.0.0' })}
          </Text>
          <Text className="text-sm text-muted-foreground font-cairo mt-1">
            {t('settings.about.madeIn')}
          </Text>
        </View>

        <View className="bg-surface-bright rounded-[20px] overflow-hidden">
          <Pressable onPress={() => {}}>
            <View className="px-4 py-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
                <Text className="text-on-surface font-cairo">{t('settings.about.privacy')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
            </View>
          </Pressable>
          <View className="border-b border-outline-variant ml-14" />
          <Pressable onPress={() => {}}>
            <View className="px-4 py-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Ionicons name="mail-outline" size={22} color={colors.primary} />
                <Text className="text-on-surface font-cairo">{t('settings.about.contact')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
