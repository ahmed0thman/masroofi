import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatFullCurrency } from '@/services/format';
import { cn } from '@/lib/utils';
import type { CurrencyRow } from '@/db/currency-repo';

interface HeroCardProps {
  totalSpent: number;
  changePercentage: number;
  showComparison: boolean;
  currency: CurrencyRow | null;
}

export function HeroCard({ totalSpent, changePercentage, showComparison, currency }: HeroCardProps) {
  const { t, i18n } = useTranslation();
  const isIncrease = changePercentage > 0;
  const locale = i18n.language;

  return (
    <View className="bg-surface-container rounded-3xl p-8 items-center justify-center mb-6 shadow-sm">
      <Text className="text-on-surface-variant text-sm font-cairo-medium mb-2">
        {t('analytics.totalSpent')}
      </Text>

      <Text className="text-on-surface leading-6 text-4xl font-cairo-bold mb-4">
        {currency ? formatFullCurrency(totalSpent, currency, locale) : totalSpent}
      </Text>

      {showComparison && (
        <View
          className={cn(
            'px-3 py-1 rounded-full flex-row items-center gap-1',
            isIncrease ? 'bg-error-container' : 'bg-success-container',
          )}
        >
          <Text
            className={cn(
              'text-xs font-cairo-semibold',
              isIncrease ? 'text-error' : 'text-success',
            )}
          >
            {isIncrease ? '↑' : '↓'} {Math.abs(changePercentage)}% {t('analytics.vsLastPeriod')}
          </Text>
        </View>
      )}
    </View>
  );
}
