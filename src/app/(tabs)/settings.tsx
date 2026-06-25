import { View, ScrollView } from 'react-native';
import React from 'react';
import SafeAreaView from '@/components/layout/SafeAreaView';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { AppSettingsSection } from '@/components/settings/AppSettingsSection';
import { RemindersSection } from '@/components/settings/RemindersSection';

export default function Settings() {
  return (
    <SafeAreaView className="p-0">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ProfileSection />
        <AppSettingsSection />
        <RemindersSection />
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
