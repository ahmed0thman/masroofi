import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StatusBar, StyleSheet, Text, View } from 'react-native';

import BackgroundMesh from './BackgroundMesh';
import AnimatedBlob from './AnimatedBlob';
import FloatingIcon from './FloatingIcon';

import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const { t } = useTranslation();

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(40)).current;

  const footerOpacity = useRef(new Animated.Value(0)).current;

  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),

        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(300),

      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),

        Animated.timing(titleY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(150),

      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish?.());
  }, []);

  const glowScale = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.65],
  });

  return (
    <View className="flex-1 pb-12" style={styles.container}>
      <StatusBar barStyle="light-content" />

      <BackgroundMesh />

      <View style={styles.center}>
        {/* Glow */}

        <Animated.View
          style={[
            styles.portal,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        {/* Blob */}

        <View style={styles.blob}>
          <AnimatedBlob />
        </View>

        {/* Logo */}

        <Animated.View
          style={[
            styles.avatar,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
              position: 'relative',
            },
          ]}
        >
          <View
            className="w-full h-full rounded-full absolute z-10"
            style={{
              backgroundImage:
                'radial-gradient(70.71% 70.71% at 50% 50%, rgba(137, 213, 192, 0.40) 0%, rgba(137, 213, 192, 0.00) 70%)',
              filter: 'blur(10px)',
            }}
          />
          <Image
            className="w-full h-full rounded-full"
            source={require('@/assets/images/splash-avatar.png')}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Floating mic */}

        <View
          style={{
            position: 'absolute',
            top: -50,
            right: -10,
          }}
        >
          <FloatingIcon>
            <MaterialIcons name="keyboard-voice" color="#89D5C0" size={28} />
          </FloatingIcon>
        </View>

        {/* Floating payment */}

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
          }}
        >
          <FloatingIcon size={42} opacity={0.45} background="rgba(255,255,255,.08)">
            <MaterialIcons name="payments" color="white" size={20} />
          </FloatingIcon>
        </View>
      </View>

      {/* Title */}

      <Animated.View
        style={{
          opacity: titleOpacity,
          transform: [{ translateY: titleY }],
          alignItems: 'center',
          marginTop: 40,
        }}
      >
        <Text style={styles.title}>{t('common.appName')}</Text>

        <Text style={styles.subtitle}>Voice Intelligence</Text>

        <View style={styles.divider} />
      </Animated.View>

      <Animated.View
        style={{
          opacity: footerOpacity,
          position: 'absolute',
          bottom: 85,
        }}
      >
        <Text style={styles.footer}>مدعوم بالذكاء الاصطناعي • Masroof AI</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141A17',
    justifyContent: 'center',
    alignItems: 'center',
  },

  center: {
    width: 320,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },

  portal: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#89D5C0',
  },

  blob: {
    position: 'absolute',
  },

  avatar: {
    width: 540,
    height: 540,
    borderRadius: 70,

    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 68,
    fontWeight: '900',
    color: '#E0E3E0',
    letterSpacing: -2,
  },

  subtitle: {
    marginTop: 12,
    color: '#89D5C0',
    fontWeight: '700',
    letterSpacing: 5,
    textTransform: 'uppercase',
    fontSize: 12,
  },

  divider: {
    width: 52,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#89D5C0',
    opacity: 0.4,
    marginTop: 22,
  },

  footer: {
    color: '#E0E3E0',
    opacity: 0.3,
    fontSize: 12,
  },
});
