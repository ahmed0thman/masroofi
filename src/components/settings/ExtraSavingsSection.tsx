import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/styles/global';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BottomSheet } from '@/components/BottomSheet';
import {
  addExtraSaving,
  deleteEntry,
  getExtraSavings,
  updateExtraSaving,
} from '@/db/saving-wallet-repo';
import type { CurrencyRow, SavingWalletEntry } from '@/schemas';
import { formatFullCurrency } from '@/services/format';
import { getCurrencyById } from '@/db/currency-repo';
import { useProfile } from '@/hooks/useProfile';

export function ExtraSavingsSection() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const { profile } = useProfile();
  const [entries, setEntries] = useState<SavingWalletEntry[]>([]);
  const [currency, setCurrency] = useState<CurrencyRow | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [amountText, setAmountText] = useState('');
  const [noteText, setNoteText] = useState('');

  const locale = i18n.language;

  const refresh = useCallback(async () => {
    const e = await getExtraSavings();
    setEntries(e);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    (async () => {
      const currencyId = profile?.currency_id ?? 1;
      const cur = await getCurrencyById(currencyId);
      if (cur) setCurrency(cur);
    })();
  }, [profile]);

  const openAdd = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditId(null);
    setAmountText('');
    setNoteText('');
    setShowAdd(true);
  }, []);

  const openEdit = useCallback((entry: SavingWalletEntry) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditId(entry.id);
    setAmountText(String(entry.amount));
    setNoteText(entry.note);
    setShowAdd(true);
  }, []);

  const closeSheet = useCallback(() => {
    setShowAdd(false);
    setEditId(null);
  }, []);

  const handleSave = useCallback(async () => {
    const amount = parseFloat(amountText);
    if (isNaN(amount) || amount <= 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (editId !== null) {
      await updateExtraSaving(editId, amount, noteText);
    } else {
      await addExtraSaving(amount, noteText);
    }
    setShowAdd(false);
    setEditId(null);
    await refresh();
  }, [amountText, noteText, editId, refresh]);

  const handleDelete = useCallback(
    (id: number) => {
      Alert.alert(t('common.delete'), t('common.delete') + '?', [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(id);
            await refresh();
          },
        },
      ]);
    },
    [t, refresh],
  );

  return (
    <View className="bg-surface-container rounded-3xl p-5 gap-4 mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="briefcase-outline" size={20} color={colors.secondary} />
          <Text className="font-cairo-semibold text-on-surface">{t('settings.extraSavings')}</Text>
        </View>
        <Button
          variant="ghost"
          size="sm"
          onPress={openAdd}
          icon={<Ionicons name="add-circle-outline" size={20} color={colors.secondary} />}
        />
      </View>

      {entries.length === 0 ? (
        <View className="items-center gap-3 py-6">
          <Ionicons name="briefcase-outline" size={48} color={colors.onSurfaceVariant} />
          <Text className="font-cairo text-sm text-on-surface-variant text-center">
            {t('settings.extraSavings')}
          </Text>
          <Button className="mt-2" variant="outline" size="sm" onPress={openAdd}>
            {t('settings.addExtraSaving')}
          </Button>
        </View>
      ) : (
        <View className="gap-2">
          {entries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              onPress={() => openEdit(entry)}
              className="bg-surface-container-low rounded-2xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="font-cairo text-base text-on-surface">
                  {currency ? formatFullCurrency(entry.amount, currency, locale) : entry.amount}
                </Text>
                {entry.note ? (
                  <Text className="font-cairo text-sm text-on-surface-variant mt-0.5">
                    {entry.note}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => handleDelete(entry.id)} className="p-2">
                <Ionicons name="trash-outline" size={16} color={colors.destructive} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <BottomSheet
        visible={showAdd}
        onClose={closeSheet}
        title={editId !== null ? t('common.edit') : t('settings.addExtraSaving')}
      >
        <View className="gap-4 p-4">
          <View className="gap-1">
            <Text className="text-muted-foreground font-cairo text-sm">
              {t('settings.extraSavingAmount')}
            </Text>
            <Input
              className="bg-surface-container-high rounded-xl px-4 py-3 text-on-surface font-cairo text-base"
              value={amountText}
              onChangeText={(text) => setAmountText(text.replace(/[^0-9.]/g, ''))}
              placeholder={t('settings.extraSavingAmount')}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
          <View className="gap-1">
            <Text className="text-muted-foreground font-cairo text-sm">
              {t('settings.extraSavingNote')}
            </Text>
            <Input
              className="bg-surface-container-high rounded-xl px-4 py-3 text-on-surface font-cairo text-base"
              value={noteText}
              onChangeText={setNoteText}
              placeholder={t('settings.extraSavingNote')}
            />
          </View>
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl bg-surface-container-high items-center"
              onPress={closeSheet}
            >
              <Text className="text-on-surface font-cairo">{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl bg-primary items-center"
              onPress={handleSave}
            >
              <Text className="text-on-primary font-cairo-semibold">{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}
