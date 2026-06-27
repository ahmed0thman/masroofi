import { View, ScrollView } from 'react-native';
import React from 'react';
import SafeAreaView from '@/components/layout/SafeAreaView';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { AppSettingsSection } from '@/components/settings/AppSettingsSection';
import { RemindersSection } from '@/components/settings/RemindersSection';
import { BudgetGoalSection } from '@/components/settings/BudgetGoalSection';

export default function Settings() {
  return (
    <SafeAreaView className="px-5">
      <ScrollView className="flex-1 flex-col gap-4" showsVerticalScrollIndicator={false}>
        <ProfileSection />
        <BudgetGoalSection />
        <RemindersSection />
        <AppSettingsSection />
      </ScrollView>
    </SafeAreaView>
  );
}
