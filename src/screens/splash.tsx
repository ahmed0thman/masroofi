import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, View } from 'react-native';

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  // ── Logo entrance ──
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoFade = useRef(new Animated.Value(0)).current;

  // ── App name entrance ──
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(24)).current;

  // ── Tagline entrance ──
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(16)).current;

  // ── Background decorative pulse ──
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous subtle pulsing behind the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // ── Main entrance sequence ──
    // 1. Logo springs in gently  (t ≈ 0 – 350ms)
    // 2. Title fades + slides up (t ≈ 600 – 950ms)
    // 3. Tagline fades + slides   (t ≈ 1100 – 1450ms)
    // Total ≈ 1.5s → well within the 2–2.5s window
    Animated.sequence([
      // ── Logo springs in ──
      Animated.parallel([
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(250),

      // ── App name fades + slides up ──
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(150),

      // ── Tagline fades in last ──
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),

    ]).start(() => onFinish?.());
  }, []);

  return (
    <View className="flex-1 bg-background items-center justify-center overflow-hidden">
      {/* ── Decorative pulsing halo behind logo ── */}
      <Animated.View
        className="absolute w-52 h-52 rounded-full"
        style={{
          backgroundColor: colors.primary,
          opacity: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.04, 0.12],
          }),
        }}
      />

      {/* ── Logo ── */}
      <Animated.View
        className="items-center"
        style={{
          opacity: logoFade,
          transform: [{ scale: logoScale }],
        }}
      >
        <View
          className="bg-primary-container rounded-full w-24 h-24"
          style={{
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View className="flex-1 items-center justify-center">
            <Image
              source={require('@/assets/images/Icon.png')}
              className="w-11 h-11"
              resizeMode="contain"
            />
          </View>
        </View>
      </Animated.View>

      {/* ── App name ── */}
      <Animated.Text
        className="text-4xl font-cairo-bold text-primary leading-tight mt-7"
        style={{
          opacity: titleOpacity,
          transform: [{ translateY: titleTranslateY }],
        }}
      >
        {t('common.appName')}
      </Animated.Text>

      {/* ── Tagline ── */}
      <Animated.Text
        className="text-base font-cairo text-muted-foreground mt-2"
        style={{
          opacity: taglineOpacity,
          transform: [{ translateY: taglineTranslateY }],
        }}
      >
        {t('common.recordYourExpenses')}
      </Animated.Text>
    </View>
  );
}
