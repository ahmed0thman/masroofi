import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import type { ExpenseRow } from '@/db/expense-repo';
import { formatAmount, formatRelativeTime } from '@/lib/format';

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
  const categoryIcon = getCategoryIcon(expense.category_name);
  const showMerchant = Boolean(expense.merchant_name);
  const symbol = i18n.language === 'ar'
    ? (expense.currency_symbol ?? expense.currency_code ?? '')
    : (expense.currency_symbol_en ?? expense.currency_symbol ?? expense.currency_code ?? '');
  const formattedPrice = formatAmount(expense.price, symbol, i18n.language);
  const relativeTime = formatRelativeTime(expense.created_at, i18n.language);

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
        <View className="bg-surface-bright rounded-lg p-1.5">
          <Ionicons name={categoryIcon} size={16} color={colors.white} />
        </View>
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="font-cairo-semibold text-lg text-foreground" numberOfLines={1}>
            {expense.item_name}
          </Text>
          <Text className="text-xs text-muted-foreground font-cairo">{relativeTime}</Text>
        </View>
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
        {showMerchant ? (
          <View className="bg-surface-bright rounded-full px-2.5 py-0.5 flex-row items-center gap-1">
            <Ionicons name="storefront-outline" size={14} color={colors.onSurface} />
            <Text className="text-sm font-cairo-medium text-on-surface">{expense.merchant_name}</Text>
          </View>
        ) : null}
        <View className="bg-primary-container/70 rounded-full px-2 py-0.5">
          <Text className="text-sm font-cairo text-on-primary">{expense.category_name ?? 'أخرى'}</Text>
        </View>
        <View className="flex-1" />
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
    </View>
  );
}
