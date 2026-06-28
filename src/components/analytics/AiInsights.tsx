import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface AiInsight {
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
}

interface AiInsightsProps {
  insights: AiInsight[];
  isLoading: boolean;
}

export function AiInsights({ insights, isLoading }: AiInsightsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View className="gap-4 mb-6">
        {[1, 2].map(i => (
          <View key={i} className="bg-surface-container-low h-24 rounded-2xl animate-pulse" />
        ))}
      </View>
    );
  }

  if (insights.length === 0) return null;

  return (
    <View className="gap-4 mb-6">
      <Text className="text-lg font-cairo-semibold text-on-surface mb-2">
        {t('analytics.aiCoach')}
      </Text>
      {insights.map((insight, idx) => (
        <View 
          key={idx} 
          className="bg-primary-container/20 border-l-4 border-primary p-4 rounded-r-2xl flex-row gap-3"
        >
          <View className="mt-1">
            <MaterialIcons name="auto-awesome" size={18} color="var(--color-primary)" />
          </View>
          <View className="flex-1">
            <Text className="font-cairo-bold text-sm text-primary mb-1">
              {insight.title}
            </Text>
            <Text className="font-cairo text-sm text-on-surface-variant leading-5">
              {insight.message}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
