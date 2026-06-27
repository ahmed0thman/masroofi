import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface PriorityBreakdownProps {
  data: Record<string, number>;
}

const PRIORITY_CONFIG: Record<string, { color: string; labelKey: string }> = {
  Essential: { color: '#079455', labelKey: 'analytics.priority.essential' },
  Important: { color: '#dc6803', labelKey: 'analytics.priority.important' },
  Normal: { color: '#6c3124', labelKey: 'analytics.priority.normal' },
  Luxury: { color: '#ba1a1a', labelKey: 'analytics.priority.luxury' },
};

export function PriorityBreakdown({ data }: PriorityBreakdownProps) {
  const { t } = useTranslation();
  
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  
  if (total === 0) {
    return (
      <View className="bg-surface-container rounded-3xl p-6 shadow-sm mb-6 items-center justify-center min-h-[180px]">
        <Text className="text-sm font-cairo text-on-surface-variant">{t('analytics.noPriorityData')}</Text>
      </View>
    );
  }

  return (
    <View className="bg-surface-container rounded-3xl p-6 shadow-sm mb-6">
      <View className="mb-4">
        <Text className="text-lg font-cairo-semibold text-on-surface">
          {t('analytics.priorityDistribution')}
        </Text>
        <Text className="text-xs font-cairo-medium text-primary">
          {t('analytics.cutBackInsight')}
        </Text>
      </View>

      <View className="w-full bg-surface-container-high rounded-full overflow-hidden h-4 flex-row">
        {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => {
          const amount = data[priority] || 0;
          const percentage = (amount / total) * 100;
          return (
            <View 
              key={priority} 
              className="h-full" 
              style={{ width: `${percentage}%`, backgroundColor: config.color }} 
            />
          );
        })}
      </View>

      <View className="mt-6 gap-3">
        {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => {
          const amount = data[priority] || 0;
          const percentage = Math.round((amount / total) * 100);
          return (
            <View key={priority} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                <Text className="font-cairo-medium text-xs text-on-surface">
                  {t(config.labelKey)}
                </Text>
              </View>
              <Text className="font-cairo-bold text-xs text-on-surface-variant">
                {percentage}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
