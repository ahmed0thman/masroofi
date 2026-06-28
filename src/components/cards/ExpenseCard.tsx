import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import type { ExpenseRow } from '@/db/expense-repo';
import { useProfile } from '@/hooks/useProfile';
import { getCurrencyById } from '@/db/currency-repo';
import type { CurrencyRow } from '@/schemas';
import { formatAmount, formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

const PRIORITY_STYLES = {
  essential: {
    bg: 'bg-success/20',
    text: 'text-success',
    labelKey: 'analytics.priority.essential' as const,
  },
  important: {
    bg: 'bg-warning/20',
    text: 'text-warning',
    labelKey: 'analytics.priority.important' as const,
  },
  luxury: {
    bg: 'bg-destructive/20',
    text: 'text-destructive',
    labelKey: 'analytics.priority.luxury' as const,
  },
  normal: {
    bg: 'bg-surface-container-high',
    text: 'text-muted-foreground',
    labelKey: 'analytics.priority.normal' as const,
  },
} as const;

const CATEGORY_MAP: Record<string, string> = {
  'أكل ومشروبات': 'categories.foodAndDrinks',
  'مواصلات': 'categories.transport',
  'فواتير': 'categories.bills',
  'تسوق': 'categories.shopping',
  'صحة': 'categories.health',
  'ترفيه': 'categories.entertainment',
  'تعليم': 'categories.education',
  'إيجار': 'categories.rent',
  'أخرى': 'categories.other',
};

function getCategoryIcon(categoryName: string | null | undefined): keyof typeof Ionicons.glyphMap {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
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
  return icons[categoryName ?? ''] ?? 'ellipsis-horizontal';
}

interface ExpenseCardProps {
  expense: ExpenseRow;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const { profile } = useProfile();
  const [profileCurrency, setProfileCurrency] = useState<CurrencyRow | null>(null);

  useEffect(() => {
    if (profile?.currency_id) {
      getCurrencyById(profile.currency_id).then(setProfileCurrency);
    }
  }, [profile?.currency_id]);

  const categoryIcon = getCategoryIcon(expense.category_name);
  const showMerchant = Boolean(expense.merchant_name);
  const symbol = profileCurrency
    ? i18n.language === 'ar'
      ? profileCurrency.symbol
      : profileCurrency.symbol_en || profileCurrency.symbol
    : '';
  const formattedPrice = formatAmount(expense.price, symbol, i18n.language);
  const relativeTime = formatRelativeTime(expense.created_at, i18n.language);

  const priorityStyle = expense.priority
    ? (PRIORITY_STYLES[expense.priority] ?? PRIORITY_STYLES.normal)
    : null;

  const handleDelete = () => {
    Alert.alert(t('review.delete'), t('review.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('review.delete'),
        style: 'destructive',
        onPress: () => onDelete?.(expense.id),
      },
    ]);
  };

  return (
    <View className="bg-card rounded-xl p-4 gap-1.5">
      <View className="flex-row items-center gap-2">
        {priorityStyle ? (
          <View className={cn('rounded-full px-2 py-0.5', priorityStyle.bg)}>
            <Text className={cn('text-xs font-cairo', priorityStyle.text)}>
              {t(priorityStyle.labelKey as any)}
            </Text>
          </View>
        ) : null}
        <View className="flex-1" />
        {onEdit ? (
          <TouchableOpacity
            onPress={() => onEdit(expense.id)}
            className="p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : null}
        {onDelete ? (
          <TouchableOpacity
            onPress={handleDelete}
            className="p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.destructive} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View className="flex-row items-center gap-2">
        <View className="bg-surface-bright rounded-lg p-1.5">
          <Ionicons name={categoryIcon} size={16} color={colors.white} />
        </View>
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="font-cairo-semibold text-lg text-foreground" numberOfLines={1}>
            {expense.item_name}
          </Text>
          <Text className="text-xs text-muted-foreground font-cairo">{relativeTime}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text
            className="font-cairo-bold text-2xl"
            style={{ direction: 'ltr', color: colors.foreground }}
          >
            {formattedPrice.amount}
            <Text className="text-sm font-cairo text-muted-foreground">
              {' '}
              {formattedPrice.suffix}
            </Text>
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {showMerchant ? (
          <View className="bg-surface-bright rounded-full px-2.5 py-0.5 flex-row items-center gap-1">
            <Ionicons name="storefront-outline" size={14} color={colors.onSurface} />
            <Text className="text-sm font-cairo-medium text-on-surface">
              {expense.merchant_name}
            </Text>
          </View>
        ) : null}
        <View className="bg-primary-container/70 rounded-full px-2 py-0.5">
          <Text className="text-sm font-cairo text-on-primary">
            {expense.category_name ? t(CATEGORY_MAP[expense.category_name] || 'categories.other') : t('categories.other')}
          </Text>
        </View>
      </View>
    </View>
  );
}
