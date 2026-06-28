import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { PeriodType } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface PeriodSelectorProps {
  periodType: PeriodType;
  onPeriodChange: (p: PeriodType) => void;
  customFrom: Date;
  customTo: Date;
  onCustomDateChange: (from: Date, to: Date) => void;
  showComparisonToggleButton: boolean;
  showComparison: boolean;
  onComparisonToggle: (v: boolean) => void;
}

export function PeriodSelector({
  periodType,
  onPeriodChange,
  customFrom,
  customTo,
  onCustomDateChange,
  showComparisonToggleButton = true,
  showComparison,
  onComparisonToggle,
}: PeriodSelectorProps) {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState<'from' | 'to' | null>(null);

  const periods: { id: PeriodType; label: string }[] = [
    { id: 'month', label: t('analytics.period.month') },
    { id: 'week', label: t('analytics.period.week') },
    { id: 'day', label: t('analytics.period.day') },
    { id: 'custom', label: t('analytics.period.custom') },
  ];

  const handlePeriodChange = (id: PeriodType) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    onPeriodChange(id);
  };

  return (
    <View className="flex-col gap-6 mb-8">
      {/* Segmented Control */}
      <View className="bg-surface-container-low rounded-full p-2 justify-around flex-row items-center relative">
        {periods.map((p) => {
          const isActive = periodType === p.id;
          return (
            <Button
              key={p.id}
              onPress={() => handlePeriodChange(p.id)}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              className="rounded-full min-w-14"
            >
              {p.label}
            </Button>
          );
        })}
      </View>

      <View className="flex-row items-center justify-between px-1">
        {/* Comparison Toggle */}
        {showComparisonToggleButton && (
          <TouchableOpacity
            onPress={() => onComparisonToggle(!showComparison)}
            className={cn(
              'flex-row items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200',
              showComparison
                ? 'bg-primary-container/30 border-primary'
                : 'bg-surface-container-low border-outline-variant',
            )}
          >
            <Text
              className={cn(
                'text-xs font-cairo-medium',
                showComparison ? 'text-on-primary' : 'text-on-surface-variant',
              )}
            >
              {t('analytics.compareToggle')}
            </Text>
            <View
              className={cn(
                'w-8 h-4 rounded-full relative transition-colors duration-200',
                showComparison ? 'bg-primary' : 'bg-outline-variant',
              )}
            >
              <View
                className={cn(
                  'absolute w-3 h-3 bg-white rounded-full top-0.5 transition-all duration-200',
                  showComparison ? 'right-0.5' : 'left-0.5',
                )}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
      {/* Custom Date Range Chips */}
      {periodType === 'custom' && (
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setShowPicker('from')}
            className="flex-1 bg-surface-container-low px-3 py-2 rounded-full border border-outline-variant flex-row items-center gap-1"
          >
            <Text className="text-sm font-cairo-bold text-secondary uppercase">
              {t('analytics.from')}:
            </Text>
            <Text className="text-sm font-cairo-medium text-on-surface-variant">
              {customFrom.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowPicker('to')}
            className="flex-1 bg-surface-container-low px-3 py-2 rounded-full border border-outline-variant flex-row items-center gap-1"
          >
            <Text className="text-sm font-cairo-bold text-secondary uppercase">
              {t('analytics.to')}:
            </Text>
            <Text className="text-sm font-cairo-medium text-on-surface-variant">
              {customTo.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {periodType === 'custom' && showPicker && (
        <DateTimePicker
          value={showPicker === 'from' ? customFrom : customTo}
          mode="date"
          onChange={(event: DateTimePickerEvent, date?: Date) => {
            setShowPicker(null);
            if (date) {
              if (showPicker === 'from') onCustomDateChange(date, customTo);
              else onCustomDateChange(customFrom, date);
            }
          }}
        />
      )}
    </View>
  );
}
