import { DirectionProvider } from '@/components/ui/direction-provider';
import '@/i18n';
import { ProfileProvider } from '@/providers/ProfileProvider';
import SplashScreen from '@/screens/splash/splash';
import { useFonts } from 'expo-font';
import {
  AndroidImportance,
  setNotificationChannelAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { DarkTheme, ThemeProvider } from 'expo-router';
import Stack from 'expo-router/stack';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import './global.css';

setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

ExpoSplashScreen.preventAutoHideAsync();

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
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded || error) {
      ExpoSplashScreen.hideAsync();
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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <DirectionProvider defaultDirection="rtl">
      <ProfileProvider>
        <StatusBar style="light" />
        <ThemeProvider value={DarkTheme}>
          {!splashDone ? (
            <SplashScreen onFinish={() => setSplashDone(true)} />
          ) : (
            <KeyboardProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="about" options={{ headerShown: false }} />
                <Stack.Screen
                  name="review"
                  options={{ headerShown: false, presentation: 'modal' }}
                />
              </Stack>
            </KeyboardProvider>
          )}
        </ThemeProvider>
      </ProfileProvider>
    </DirectionProvider>
  );
}
