import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatCurrencyShort } from '@/services/format';
import { cn } from '@/lib/utils';

interface ItemData {
  name: string;
  amount: number;
}

interface TopBottomItemsProps {
  topItems: ItemData[];
  bottomItems: ItemData[];
  currencySymbol?: string;
}

function ItemColumn({ title, items, isTop, currencySymbol }: { title: string; items: ItemData[]; isTop: boolean; currencySymbol?: string }) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 5);
  const maxAmount = items.length > 0 ? Math.max(...items.map(i => i.amount)) : 0;

  return (
    <View className="bg-surface-bright rounded-[20px] p-4 shadow-md flex-1">
      <Text className="text-sm font-cairo-semibold text-foreground mb-3">{title}</Text>
      <View className="gap-y-3">
        {visibleItems.map((item, idx) => (
          <View key={idx} className="flex-col gap-y-1">
            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-cairo flex-1" numberOfLines={1}>{item.name}</Text>
              <Text className="text-xs font-cairo-bold text-foreground">{formatCurrencyShort(item.amount, currencySymbol, i18n.language)}</Text>
            </View>
            <View className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
              <View 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0}%` }} 
              />
            </View>
          </View>
        ))}
      </View>
      {items.length > 5 && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} className="items-center mt-3">
          <Text className="text-xs font-cairo-medium text-primary">
            {expanded ? t('analytics.showLess') : t('analytics.showAll')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function TopBottomItems({ topItems, bottomItems, currencySymbol }: TopBottomItemsProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row mx-5 gap-3 mb-4">
      <ItemColumn title={t('analytics.topItems')} items={topItems} isTop={true} currencySymbol={currencySymbol} />
      <ItemColumn title={t('analytics.bottomItems')} items={bottomItems} isTop={false} currencySymbol={currencySymbol} />
    </View>
  );
}
