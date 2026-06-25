import { DirectionProvider } from '@/components/ui/direction-provider';
import '@/i18n';
import { useFonts } from 'expo-font';
import Stack from 'expo-router/stack';
import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import {
  setNotificationChannelAsync,
  setNotificationHandler,
  AndroidImportance,
} from 'expo-notifications';
import './global.css';

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setNotificationChannelAsync('default', {
        name: 'Masroofi Reminders',
        importance: AndroidImportance.HIGH,
      });
    }
  }, []);

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-foreground">Error loading fonts</Text>
      </View>
    );
  }

  return (
    <DirectionProvider defaultDirection="rtl">
      <StatusBar style="light" />
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="review" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </DirectionProvider>
  );
}
