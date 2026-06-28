import SafeAreaView from '@/components/layout/SafeAreaView';
import { AppSettingsSection } from '@/components/settings/AppSettingsSection';
import { BudgetGoalSection } from '@/components/settings/BudgetGoalSection';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { RemindersSection } from '@/components/settings/RemindersSection';
import { ScrollView } from 'react-native';

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
