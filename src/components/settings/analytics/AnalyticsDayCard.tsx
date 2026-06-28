import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/styles/global';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { cn } from '@/lib/utils';
import { getProfile, updateProfile } from '@/db/profile-repo';

/** Day indices wrapped in object to preserve numeric type without template-literal issues */
const DAY_ENTRIES = [
  { day: 0 as const, labelKey: 'settings.days.0' as const },
  { day: 1 as const, labelKey: 'settings.days.1' as const },
  { day: 2 as const, labelKey: 'settings.days.2' as const },
  { day: 3 as const, labelKey: 'settings.days.3' as const },
  { day: 4 as const, labelKey: 'settings.days.4' as const },
  { day: 5 as const, labelKey: 'settings.days.5' as const },
  { day: 6 as const, labelKey: 'settings.days.6' as const },
] as const;

type DayEntry = (typeof DAY_ENTRIES)[number];

export function AnalyticsDayCard() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const [analyticsDay, setAnalyticsDay] = useState(5);

  useEffect(() => {
    getProfile().then((profile) => {
      if (profile) setAnalyticsDay(profile.analytics_day);
    });
  }, []);

  // In RTL (Arabic), order days Saturday first (6, 0, 1, 2, 3, 4, 5)
  const orderedDays: DayEntry[] = i18n.language === 'ar'
    ? [DAY_ENTRIES[6], DAY_ENTRIES[0], DAY_ENTRIES[1], DAY_ENTRIES[2], DAY_ENTRIES[3], DAY_ENTRIES[4], DAY_ENTRIES[5]]
    : [...DAY_ENTRIES];

  const handleDaySelect = useCallback(async (day: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnalyticsDay(day);
    await updateProfile({ analytics_day: day });
  }, []);

  return (
    <View className="bg-surface-container rounded-3xl p-5 gap-4">
      <View className="flex-row items-center gap-2">
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text className="font-cairo-semibold text-on-surface">{t('settings.analyticsScheduler')}</Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {orderedDays.map((entry) => {
          const isActive = entry.day === analyticsDay;
          return (
            <Pressable
              key={entry.day}
              onPress={() => handleDaySelect(entry.day)}
              className={cn(
                'rounded-full px-4 py-2',
                isActive ? 'bg-primary' : 'bg-surface-container-high',
              )}
            >
              <Text
                className={cn(
                  'font-cairo-medium text-sm',
                  isActive ? 'text-on-primary' : 'text-on-surface-variant',
                )}
              >
                {t(entry.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
