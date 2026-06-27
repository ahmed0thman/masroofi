import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LineChart } from '@/components/charts/LineChart';

interface SpendingTrendProps {
  data: Array<{ date: string; amount: number }>;
  periodLabel?: string;
}

export function SpendingTrend({ data, periodLabel }: SpendingTrendProps) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <View className="bg-surface-container rounded-3xl p-6 shadow-sm mb-6 items-center justify-center min-h-[240px]">
        <Text className="text-sm font-cairo text-on-surface-variant">{t('analytics.insufficientTrendData')}</Text>
      </View>
    );
  }

  const chartData = data.map(d => ({
    label: d.date.split('-').slice(1).join('/'), // Simplified date label
    value: d.amount,
  }));

  return (
    <View className="bg-surface-container rounded-3xl p-6 shadow-sm mb-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-lg font-cairo-semibold text-on-surface">
          {t('analytics.spendingVelocity')}
        </Text>
        {periodLabel && (
          <Text className="text-xs font-cairo-medium text-on-surface-variant">{periodLabel}</Text>
        )}
      </View>

      <LineChart 
        data={chartData} 
        height={180} 
        showLabels 
      />
      
      <View className="flex-row justify-between mt-6 pt-6 border-t border-outline-variant">
        <View className="flex-1">
          <Text className="text-[10px] font-cairo-medium text-on-surface-variant uppercase tracking-wider">
            {t('analytics.highestDay')}
          </Text>
          <Text className="text-sm font-cairo-bold text-on-surface">
            {data.reduce((prev, current) => (prev.amount > current.amount) ? prev : current).date}
          </Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-[10px] font-cairo-medium text-on-surface-variant uppercase tracking-wider">
            {t('analytics.lowestDay')}
          </Text>
          <Text className="text-sm font-cairo-bold text-on-surface">
            {data.reduce((prev, current) => (prev.amount < current.amount) ? prev : current).date}
          </Text>
        </View>
      </View>
    </View>
  );
}
