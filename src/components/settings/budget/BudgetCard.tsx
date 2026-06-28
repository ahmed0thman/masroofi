import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBudget } from '@/hooks/useBudget';
import { useThemeColors } from '@/styles/global';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatFullCurrency } from '@/services/format';
import { Input } from '@/components/ui/input';
import { getCurrencyById } from '@/db/currency-repo';
import { useProfile } from '@/hooks/useProfile';
import type { CurrencyRow } from '@/schemas';

export function BudgetCard() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const { budget, setBudgetAmount } = useBudget();
  const { profile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [currency, setCurrency] = useState<CurrencyRow | null>(null);

  useEffect(() => {
    (async () => {
      const currencyId = profile?.currency_id ?? 1;
      const cur = await getCurrencyById(currencyId);
      setCurrency(cur);
    })();
  }, [profile]);

  const locale = i18n.language;

  const open = () => {
    setValue(budget > 0 ? String(budget) : '');
    setEditing(true);
    // console.log('here');
  };

  const save = async () => {
    const amount = parseFloat(value);
    if (isNaN(amount) || amount < 0) return;
    await setBudgetAmount(amount);
    setEditing(false);
  };

  return (
    <View className="bg-surface-container rounded-3xl p-5">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="wallet-outline" size={20} color={colors.secondary} />
          <Text className="font-cairo-semibold text-on-surface">{t('settings.budget')}</Text>
        </View>
        {!editing && (
          <TouchableOpacity onPress={open} className="p-2">
            <Ionicons name="pencil-outline" size={18} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>

      {editing ? (
        <View className="gap-3">
          <Input
            className="bg-surface-container-low rounded-2xl px-5 py-4 font-cairo text-on-surface placeholder:text-on-surface-variant"
            placeholder={t('settings.budgetPlaceholder')}
            placeholderTextColor={colors.onSurfaceVariant}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            autoFocus
          />
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setEditing(false)}
              className="flex-1 py-3 rounded-2xl items-center bg-surface-container-high"
            >
              <Text className="font-cairo text-on-surface">{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={save}
              className="flex-1 py-3 rounded-2xl items-center bg-primary"
            >
              <Text className="font-cairo-semibold text-on-primary">{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text className="font-cairo-bold leading-7 text-3xl text-on-surface">
          {budget > 0 && currency
            ? formatFullCurrency(budget, currency, locale)
            : t('settings.budgetDesc')}
        </Text>
      )}
    </View>
  );
}
