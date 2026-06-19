import Header from '@/components/Header';
import { LanguagePicker } from '@/components/languagePicker';
import SafeAreaView from '@/components/layout/SafeAreaView';
import { Avatar } from '@/components/ui/avatar';
import OnboardingScreen from '@/screens/onBoarding';
import SplashScreen from '@/screens/splash';
import WhipserScreen from '@/screens/whipser';
import { useState } from 'react';
import { Image, Text, View } from 'react-native';

const HomeScreen = () => {
  const userInitials = 'AH'; // Replace with dynamic initials if available
  const [loading, setLoading] = useState(true);
  const [profileImageError, setProfileImageError] = useState(false);

  // Simulate loading for demonstration purposes
  setTimeout(() => {
    setLoading(false);
  }, 2000);

  if (loading) {
    return <SplashScreen />;
  }
  return (
    <SafeAreaView>
      {/* header */}
      <Header />
      <WhipserScreen />
    </SafeAreaView>
  );
};

export default HomeScreen;
