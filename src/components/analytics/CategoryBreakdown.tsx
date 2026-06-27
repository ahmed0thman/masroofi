import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PieChart } from '@/components/charts/PieChart';

interface CategoryBreakdownProps {
  data: Record<string, number>;
}

const CATEGORY_COLORS = [
  '#004c3f',
  '#156a59',
  '#6c3124',
  '#ba1a1a',
  '#079455',
  '#dc6803',
  '#1570ef',
  '#89d5c0',
];

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const { t } = useTranslation();

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <View className="bg-surface-container rounded-3xl p-6 shadow-sm mb-6 items-center justify-center min-h-[240px]">
        <Text className="text-sm font-cairo text-on-surface-variant">
          {t('analytics.noCategoryData')}
        </Text>
      </View>
    );
  }

  const chartData = entries.map(([label, value], idx) => ({
    label,
    value,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }));

  return (
    <View className="bg-surface-container rounded-3xl p-6 shadow-sm mb-6">
      <Text className="text-lg font-cairo-semibold text-on-surface mb-6">
        {t('analytics.categoryComposition')}
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-1 items-center">
          <PieChart data={chartData} size={140} innerRadius={50} showLegend={false} />
        </View>

        <ScrollView className="flex-1 ml-4 max-h-40">
          <View className="gap-3">
            {chartData.map((d, idx) => {
              const total = entries.reduce((sum, e) => sum + e[1], 0);
              const pct = Math.round((d.value / total) * 100);
              return (
                <View key={idx} className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <Text
                    className="font-cairo-medium text-xs text-on-surface flex-1"
                    numberOfLines={1}
                  >
                    {d.label}
                  </Text>
                  <Text className="font-cairo-bold text-xs text-on-surface-variant">{pct}%</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
