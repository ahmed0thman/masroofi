import { View, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/styles/global';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import type { ExpenseRow } from '@/db/expense-repo';
import { formatAmount, formatRelativeTime } from '@/lib/format';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'أكل ومشروبات': 'restaurant',
  مواصلات: 'car',
  فواتير: 'document-text',
  تسوق: 'cart',
  صحة: 'medkit',
  ترفيه: 'film',
  تعليم: 'book',
  إيجار: 'home',
  أخرى: 'ellipsis-horizontal',
};

const DEFAULT_ICON: keyof typeof Ionicons.glyphMap = 'ellipsis-horizontal';

interface ExpenseCardProps {
  expense: ExpenseRow;
}

export default function ExpenseCard({ expense }: ExpenseCardProps) {
  const colors = useThemeColors();
  const { i18n } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const categoryIcon = CATEGORY_ICONS[expense.main_category] ?? DEFAULT_ICON;
  const showDescription = Boolean(expense.description && expense.description !== expense.item);
  const showMerchant = Boolean(expense.merchant);
  const formattedPrice = formatAmount(expense.price, expense.currency);
  const relativeTime = formatRelativeTime(expense.created_at, i18n.language);

  return (
    <Animated.View
      className="bg-card rounded-[20px] p-4 items-start gap-3"
      style={{ opacity: fadeAnim }}
    >
      <View className="flex-row items-start justify-between mb-3 gap-4">
        <View className="bg-surface-bright rounded-md p-3">
          <Ionicons name={categoryIcon} size={20} color={colors.white} />
        </View>

        <View className=" gap-1 items-start flex-grow">
          {/* <Ionicons name="location-outline" size={12} color={colors.mutedForeground} /> */}
          {showMerchant ? (
            <Text className="text-muted-foreground font-cairo-medium text-xl">
              {expense.merchant}
            </Text>
          ) : null}
          <Text className="text-muted-foreground font-cairo text-sm mb-2">
            {expense.sub_category} . {relativeTime}
          </Text>
        </View>

        <Text className="text-foreground leading-6! font-cairo-bold text-3xl">
          {formattedPrice.amount}{' '}
          <Text className="text-sm font-cairo text-muted-foreground">{formattedPrice.suffix}</Text>
        </Text>
      </View>

      <Text className="text-on-surface font-cairo-semibold text-base mb-0.5">{expense.item}</Text>
      {/* {showDescription ? (
        <Text className="text-muted-foreground font-cairo text-xs flex-1" numberOfLines={2}>
          {expense.description}
        </Text>
      ) : null} */}

      <View className="flex-row w-full items-center justify-end gap-3 pt-2 border-t border-outline-variant/40">
        <View className="bg-primary-container rounded-full px-3 py-1.5">
          <Text className="text-on-primary font-cairo-semibold text-xs ">
            {expense.main_category}
          </Text>
        </View>
      </View>

      {expense.confidence < 0.6 ? (
        <View className="flex-row items-center gap-1 mt-2">
          <Ionicons name="alert-circle-outline" size={12} color={colors.warning} />
          <Text className="text-warning font-cairo text-xs">قد يحتاج مراجعة</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}
