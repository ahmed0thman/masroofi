import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/services/format';

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
}

export function KpiCard({ label, value, subValue }: KpiCardProps) {
  return (
    <View className="bg-surface-container-low rounded-2xl p-4 flex-1">
      <Text className="text-on-surface-variant text-xs font-cairo-medium mb-1">
        {label}
      </Text>
      <Text className="text-on-surface text-lg font-cairo-bold">
        {value}
      </Text>
      {subValue && (
        <Text className="text-on-surface-variant text-[10px] font-cairo mt-1">
          {subValue}
        </Text>
      )}
    </View>
  );
}

// Exporting KpiRow as a wrapper for the grid
export function KpiRow({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row gap-4 mb-6">
      {children}
    </View>
  );
}
