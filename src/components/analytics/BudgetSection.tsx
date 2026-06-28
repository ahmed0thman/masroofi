import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import { useThemeColors } from '@/styles/global';
import type { CurrencyRow } from '@/db/currency-repo';
import { formatShortCurrency } from '@/services/format';

interface BudgetSectionProps {
  percentage: number;
  monthlyBudget: number;
  spent: number;
  currency: CurrencyRow | null;
}

export function BudgetSection({
  percentage,
  monthlyBudget,
  spent,
  currency,
}: BudgetSectionProps) {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const symbol = currency
    ? (i18n.language === 'ar' ? currency.symbol : (currency.symbol_en || currency.symbol))
    : '';
  
  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (percentage / 100) * circumference;

  return (
    <View className="bg-surface-container rounded-3xl p-6 items-center justify-center mb-6 shadow-sm">
      <Text className="text-on-surface-variant text-sm font-cairo-medium mb-6">
        {t('analytics.budgetUtilization')}
      </Text>
      
      <View className="items-center justify-center relative">
        <Svg width={size} height={size}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.outlineVariant}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        
        <View className="absolute items-center justify-center">
          <Text className="text-3xl font-cairo-bold text-on-surface">
            {percentage}%
          </Text>
          <Text className="text-xs font-cairo-medium text-on-surface-variant">
            {t('analytics.budgetUsed')}
          </Text>
        </View>
      </View>
      
      <View className="mt-6 flex-row items-center gap-4">
        <View className="items-center">
          <Text className="text-xs text-on-surface-variant font-cairo">{t('analytics.budget')}</Text>
          <Text className="font-cairo-semibold text-on-surface">{formatShortCurrency(monthlyBudget)} {symbol}</Text>
        </View>
        <View className="w-px h-8 bg-outline-variant" />
        <View className="items-center">
          <Text className="text-xs text-on-surface-variant font-cairo">{t('analytics.spent')}</Text>
          <Text className="font-cairo-semibold text-on-surface">{formatShortCurrency(spent)} {symbol}</Text>
        </View>
      </View>
    </View>
  );
}
