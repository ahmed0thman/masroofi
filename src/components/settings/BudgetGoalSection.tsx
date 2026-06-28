import React from 'react';
import { View } from 'react-native';
import { BudgetCard } from '@/components/settings/budget/BudgetCard';
import { AnalyticsDayCard } from '@/components/settings/analytics/AnalyticsDayCard';
import { SavingsGoalsCard } from '@/components/settings/goals/SavingsGoalsCard';

export function BudgetGoalSection() {
  return (
    <View className="flex-col gap-6 mb-8">
      <BudgetCard />
      <AnalyticsDayCard />
      <SavingsGoalsCard />
    </View>
  );
}
