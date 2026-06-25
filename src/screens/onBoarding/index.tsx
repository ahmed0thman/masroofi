import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  AccessibilityInfo,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';

import SafeAreaView from '@/components/layout/SafeAreaView';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDirection } from '@/components/ui/direction-provider';
import { useProfile } from '@/hooks/useProfile';
import { getAllReminders, insertReminder } from '@/db/reminder-repo';

import {
  SCREEN_WIDTH,
  SLIDE_COUNT,
  DEBOUNCE_MS,
  SLIDES,
  ONBOARDING_COMPLETED_KEY,
} from './constants';
import type { OnboardingScreenProps } from './constants';
import DotIndicators from './DotIndicators';
import SlideContent from './SlideContent';

// ─── Main Component ───────────────────────────────────────────────────────────

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish, name: externalName, onNameChange: externalOnNameChange }) => {
  const { t, i18n } = useTranslation();
  const { isRTL, setDirection } = useDirection();
  const router = useRouter();
  const { createProfile } = useProfile();

  // ── State ──────────────────────────────────────────────────────────────

  const [activeSlide, setActiveSlide] = useState(0);
  const [name, setName] = useState(externalName ?? '');
  const [showNameError, setShowNameError] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notifDenied, setNotifDenied] = useState(false);
  const [timePickerDate, setTimePickerDate] = useState(new Date());
  const [reduceMotion, setReduceMotion] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────

  const scrollViewRef = useRef<ScrollView>(null);
  const lastPressTime = useRef(0);

  // ── Check reduce motion ────────────────────────────────────────────────

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => subscription.remove();
  }, []);

  // ── Load reminders from DB on mount ────────────────────────────────

  useEffect(() => {
    getAllReminders().then((rows) => {
      if (rows.length > 0) {
        setReminders(rows.map((r) => `${r.time} ${r.meridiem}`));
      }
    });
  }, []);

  // ── Slide Navigation ──────────────────────────────────────────────────

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= SLIDE_COUNT) return;
      setActiveSlide(index);
      scrollViewRef.current?.scrollTo({
        x: isRTL ? (SLIDE_COUNT - 1 - index) * SCREEN_WIDTH : index * SCREEN_WIDTH,
        animated: !reduceMotion,
      });
    },
    [reduceMotion, isRTL]
  );

  const goNext = useCallback(() => {
    const now = Date.now();
    if (now - lastPressTime.current < DEBOUNCE_MS) return;
    lastPressTime.current = now;

    if (activeSlide === 1) {
      const trimmed = name.trim();
      if (!trimmed) {
        setShowNameError(true);
        return;
      }
      setShowNameError(false);
    }

    if (activeSlide < SLIDE_COUNT - 1) {
      goToSlide(activeSlide + 1);
    }
  }, [activeSlide, goToSlide, name]);

  const goPrev = useCallback(() => {
    if (activeSlide > 0) {
      goToSlide(activeSlide - 1);
    }
  }, [activeSlide, goToSlide]);

  // ── Scroll event handler (user swipes) ─────────────────────────────────

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const rawPage = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      const page = isRTL ? SLIDE_COUNT - 1 - rawPage : rawPage;
      if (activeSlide === 1 && page > 1 && !name.trim()) {
        setShowNameError(true);
        goToSlide(1);
        return;
      }
      setActiveSlide(page);
    },
    [isRTL, activeSlide, name, goToSlide]
  );

  // ── Handle Finish / Get Started ───────────────────────────────────────

  const handleFinish = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setShowNameError(true);
      return;
    }
    const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
    try {
      await createProfile({
        name: trimmed,
        language: lang,
        theme: 'system',
        reminders_enabled: reminders.length > 0 ? 1 : 0,
      });
      for (const r of reminders) {
        const [timePart, meridiem] = r.split(' ');
        await insertReminder({ time: timePart, meridiem });
      }
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      router.replace('/(tabs)');
    } catch {
      Alert.alert(t('common.error'), t('common.retry'));
    }
  }, [name, reminders, createProfile, router, t, i18n.language]);

  // ── Handle Skip ──────────────────────────────────────────────────────

  const handleSkip = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setShowNameError(true);
      return;
    }
    const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
    try {
      await createProfile({ name: trimmed, language: lang });
      for (const r of reminders) {
        const [timePart, meridiem] = r.split(' ');
        await insertReminder({ time: timePart, meridiem });
      }
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      router.replace('/(tabs)');
    } catch {
      Alert.alert(t('common.error'), t('common.retry'));
    }
  }, [name, reminders, createProfile, router, t, i18n.language]);

  // ── Language Toggle ──────────────────────────────────────────────────

  const handleLanguageChange = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang);
      const dir = lang === 'ar' ? 'rtl' : 'ltr';
      setDirection(dir);
    },
    [i18n, setDirection]
  );

  // ── Button Press Haptics (no animated scale) ──────────────────────────

  const handlePressIn = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics unavailable
    }
  }, []);

  // ── Derived State ────────────────────────────────────────────────────

  const isLastSlide = activeSlide === SLIDE_COUNT - 1;
  const currentLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const isArabic = currentLang === 'ar';

  // ── Time formatting ─────────────────────────────────────────────

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = (hours % 12 || 12).toString();
    return `${hour12}:${minutes} ${period}`;
  };

  // ── Reminder handlers ────────────────────────────────────────────────

  const handleAddReminder = useCallback(async () => {
    if (reminders.length >= 3) return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setTimePickerDate(new Date());
      setShowTimePicker(true);
    } else {
      setNotifDenied(true);
    }
  }, [reminders.length]);

  const scheduleReminder = useCallback(
    async (date: Date) => {
      const timeStr = formatTime(date);
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: timeStr,
          content: {
            title: t('onboarding.reminder.title'),
            body: t('onboarding.reminder.notificationBody'),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: date.getHours(),
            minute: date.getMinutes(),
          },
        });
      } catch {
        // Silently fail
      }
      return timeStr;
    },
    [t],
  );

  const handleTimeValueChange = useCallback(
    (_: DateTimePickerChangeEvent, selectedDate: Date) => {
      if (Platform.OS === 'android') {
        setShowTimePicker(false);
        scheduleReminder(selectedDate);
        setReminders((prev) => [...prev, formatTime(selectedDate)]);
      } else {
        setTimePickerDate(selectedDate);
      }
    },
    [scheduleReminder],
  );

  const handleTimeDismiss = useCallback(() => {
    setShowTimePicker(false);
  }, []);

  const handleTimeConfirm = useCallback(() => {
    setShowTimePicker(false);
    scheduleReminder(timePickerDate);
    setReminders((prev) => [...prev, formatTime(timePickerDate)]);
  }, [timePickerDate, scheduleReminder]);

  const handleRemoveReminder = useCallback(
    async (time: string) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(time);
      } catch {
        // Silently fail
      }
      setReminders((prev) => prev.filter((t) => t !== time));
    },
    [],
  );

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="p-0">
      <View className="flex-1">
        {!isLastSlide && (
          <Pressable
            onPress={handleSkip}
            className={cn(
              'absolute top-2 z-10 px-5 py-2',
              isRTL ? 'left-0' : 'right-0'
            )}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.skip')}
            hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
          >
            <Text className="text-sm font-cairo-medium text-muted-foreground">
              {t('onboarding.skip')}
            </Text>
          </Pressable>
        )}

        <View className="flex-1 overflow-hidden">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            scrollEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
          >
            {SLIDES.map((slide, i) => (
              <SlideContent
                key={i}
                slideIndex={i}
                slide={slide}
                isArabic={isArabic}
                onLanguageChange={handleLanguageChange}
                reminders={reminders}
                onAddReminder={handleAddReminder}
                onRemoveReminder={handleRemoveReminder}
                notifDenied={notifDenied}
                name={name}
                onNameChange={(text) => {
                  setName(text);
                  if (showNameError) setShowNameError(false);
                  externalOnNameChange?.(text);
                }}
                showNameError={showNameError}
                onNameErrorDismiss={() => setShowNameError(false)}
              />
            ))}
          </ScrollView>
        </View>

        <View className="px-5 pb-6 gap-6">
          <DotIndicators
            slidesCount={SLIDE_COUNT}
            activeSlide={activeSlide}
          />

          <Button
            variant="default"
            className="w-full h-12 rounded-xl"
            onPress={isLastSlide ? handleFinish : goNext}
            onPressIn={handlePressIn}
            accessibilityLabel={
              isLastSlide
                ? t('onboarding.getStarted')
                : t('onboarding.next')
            }
          >
            {isLastSlide
              ? t('onboarding.getStarted')
              : t('onboarding.next')}
          </Button>
        </View>

        {/* ── Time Picker Modal Overlay ─────────────────────────────── */}
        {showTimePicker && (
          <View className="absolute inset-0 z-50 items-center justify-center bg-black/50">
            <View className="bg-surface rounded-2xl p-6 mx-8 items-center shadow-lg">
              <DateTimePicker
                value={timePickerDate}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onValueChange={handleTimeValueChange}
                onDismiss={handleTimeDismiss}
              />
              {Platform.OS === 'ios' && (
                <Button
                  variant="default"
                  className="mt-4 w-full h-11 rounded-xl"
                  onPress={handleTimeConfirm}
                >
                  {t('common.save')}
                </Button>
              )}
              {Platform.OS === 'ios' && (
                <Pressable
                  className="mt-2"
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text className="font-cairo-medium text-sm text-muted-foreground text-center">
                    {t('common.cancel')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
