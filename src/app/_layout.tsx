import { DirectionProvider } from '@/components/ui/direction-provider';
import '@/i18n';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import './global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isMounted, setIsMounted] = useState(false);
  const [fontsLoaded, error] = useFonts({
    'cairo-extralight': require('../../assets/fonts/cairo/Cairo-ExtraLight.ttf'),
    'cairo-light': require('../../assets/fonts/cairo/Cairo-Light.ttf'),
    'cairo-regular': require('../../assets/fonts/cairo/Cairo-Regular.ttf'),
    'cairo-medium': require('../../assets/fonts/cairo/Cairo-Medium.ttf'),
    'cairo-semibold': require('../../assets/fonts/cairo/Cairo-SemiBold.ttf'),
    'cairo-bold': require('../../assets/fonts/cairo/Cairo-Bold.ttf'),
    'cairo-extrabold': require('../../assets/fonts/cairo/Cairo-ExtraBold.ttf'),
  });

  useEffect(() => {
    SplashScreen.hideAsync();
    if (!fontsLoaded || error) return;
  }, []);

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1b1c1a]">
        <Text className="text-white">Error loading fonts</Text>
      </View>
    );
  }

  return (
    <DirectionProvider defaultDirection="rtl">
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </DirectionProvider>
  );
}
