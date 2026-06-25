import { useEffect, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import OnboardingScreen from '@/screens/onBoarding';
import { ONBOARDING_COMPLETED_KEY } from '@/screens/onBoarding/constants';
import { getDb } from '@/db';
import { getProfile } from '@/db/profile-repo';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        await getDb();
        const profile = await getProfile();
        if (profile) {
          router.replace('/(tabs)');
          return;
        }
        const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        if (completed !== 'true') {
          router.replace('/(tabs)');
          return;
        }
        setShowOnboarding(true);
      } catch {
        setShowOnboarding(true);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [router]);

  if (loading) {
    return <View className="bg-background flex-1" />;
  }

  if (!showOnboarding) {
    return null;
  }

  return <OnboardingScreen />;
}
