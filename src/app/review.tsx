import { View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import SafeAreaView from '@/components/layout/SafeAreaView';
import { Text } from '@/components/ui/text';
import * as Haptics from 'expo-haptics';
import { insertExpense } from '@/db/expense-repo';
import type { ExpenseRecord } from '@/services/gemini';
import { BottomSheet } from '@/components/BottomSheet';
import { cn } from '@/lib/utils';
import { getPendingExpenses, clearPendingExpenses } from '@/lib/pending-expenses';

const CATEGORIES = [
  'أكل ومشروبات',
  'مواصلات',
  'فواتير',
  'تسوق',
  'صحة',
  'ترفيه',
  'تعليم',
  'إيجار',
  'أخرى',
];

interface EditableExpense extends ExpenseRecord {
  localId: number;
}

let nextLocalId = 0;

export default function ReviewScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();
  const [expenses, setExpenses] = useState<EditableExpense[]>([]);
  const [categoryPickerIndex, setCategoryPickerIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const pending = getPendingExpenses();
    setExpenses(
      pending.map((exp) => ({
        ...exp,
        localId: nextLocalId++,
      })),
    );
  }, []);

  const updateExpense = (localId: number, updates: Partial<ExpenseRecord>) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.localId === localId ? { ...exp, ...updates } : exp)),
    );
  };

  const deleteExpense = (localId: number) => {
    setExpenses((prev) => prev.filter((exp) => exp.localId !== localId));
  };

  const handleSave = async () => {
    if (expenses.length === 0) return;
    setIsSaving(true);
    try {
      for (const exp of expenses) {
        await insertExpense({
          item: exp.item,
          price: exp.price,
          currency: exp.currency,
          sub_category: exp.subCategory,
          main_category: exp.mainCategory,
          description: exp.description,
          confidence: exp.confidence,
          merchant: exp.merchant,
          transcript_id: null,
        });
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearPendingExpenses();
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert(t('common.error'), String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // Empty state: all expenses deleted
  if (expenses.length === 0) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1 justify-center items-center px-5">
          <Ionicons name="document-text-outline" size={48} color={colors.mutedForeground} />
          <Text className="text-muted-foreground font-cairo text-lg mt-4 text-center">
            {t('review.noExpenses')}
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-xl py-3 px-6 mt-6"
            activeOpacity={0.8}
            onPress={handleGoBack}
          >
            <Text className="text-on-primary font-cairo-semibold">{t('review.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity onPress={handleGoBack} className="p-2">
          <Ionicons name="close" size={24} color={colors.onPrimary} />
        </TouchableOpacity>
        <Text className="text-lg font-cairo-bold text-on-surface">{t('review.title')}</Text>
        <View className="w-10" />
      </View>

      {/* Expenses List */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="items-center"
        showsVerticalScrollIndicator={false}
      >
        {expenses.map((expense, index) => (
          <View key={expense.localId} className="bg-card w-full rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-cairo-bold text-muted-foreground">
                {t('review.expenseNumber', { number: index + 1 })}
              </Text>
              <TouchableOpacity
                onPress={() => deleteExpense(expense.localId)}
                className="bg-destructive/10 rounded-full p-2"
              >
                <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              </TouchableOpacity>
            </View>

            <View className="gap-3">
              <View>
                <Text className="text-xs font-cairo text-muted-foreground mb-1">
                  {t('review.item')}
                </Text>
                <TextInput
                  className="bg-surface-bright rounded-xl px-3 py-2.5 text-on-surface font-cairo"
                  value={expense.item}
                  onChangeText={(text) => updateExpense(expense.localId, { item: text })}
                  placeholder={t('review.item')}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-cairo text-muted-foreground mb-1">
                    {t('review.price')}
                  </Text>
                  <TextInput
                    className="bg-surface-bright rounded-xl px-3 py-2.5 text-on-surface font-cairo"
                    value={String(expense.price)}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, '');
                      updateExpense(expense.localId, { price: cleaned ? Number(cleaned) : 0 });
                    }}
                    keyboardType="number-pad"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
                <View className="w-24">
                  <Text className="text-xs font-cairo text-muted-foreground mb-1">
                    {t('review.currency')}
                  </Text>
                  <TextInput
                    className="bg-surface-bright rounded-xl px-3 py-2.5 text-on-surface font-cairo"
                    value={expense.currency}
                    onChangeText={(text) => updateExpense(expense.localId, { currency: text })}
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
              </View>

              <View>
                <Text className="text-xs font-cairo text-muted-foreground mb-1">
                  {t('review.category')}
                </Text>
                <TouchableOpacity
                  className="bg-surface-bright rounded-xl px-3 py-2.5 flex-row items-center justify-between"
                  onPress={() => setCategoryPickerIndex(index)}
                >
                  <Text className="text-on-surface font-cairo">{expense.mainCategory}</Text>
                  <Ionicons name="chevron-down" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              <View>
                <Text className="text-xs font-cairo text-muted-foreground mb-1">
                  {t('review.subCategory')}
                </Text>
                <TextInput
                  className="bg-surface-bright rounded-xl px-3 py-2.5 text-on-surface font-cairo"
                  value={expense.subCategory}
                  onChangeText={(text) => updateExpense(expense.localId, { subCategory: text })}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>

              <View>
                <Text className="text-xs font-cairo text-muted-foreground mb-1">
                  {t('review.merchant')}
                </Text>
                <TextInput
                  className="bg-surface-bright rounded-xl px-3 py-2.5 text-on-surface font-cairo"
                  value={expense.merchant ?? ''}
                  onChangeText={(text) =>
                    updateExpense(expense.localId, { merchant: text || null })
                  }
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>

              <View>
                <Text className="text-xs font-cairo text-muted-foreground mb-1">
                  {t('review.description')}
                </Text>
                <TextInput
                  className="bg-surface-bright rounded-xl px-3 py-2.5 text-on-surface font-cairo"
                  value={expense.description}
                  onChangeText={(text) => updateExpense(expense.localId, { description: text })}
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View className="flex-row items-center gap-2">
                <View className="h-1.5 flex-1 rounded-full bg-surface-bright overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(expense.confidence * 100)}%`,
                      backgroundColor: expense.confidence >= 0.6 ? colors.success : colors.warning,
                    }}
                  />
                </View>
                <Text className="text-xs font-cairo text-muted-foreground">
                  {Math.round(expense.confidence * 100)}%
                </Text>
              </View>
            </View>
          </View>
        ))}
        <View className="h-24" />
      </ScrollView>

      {/* Save Button */}
      <View className="px-4 pb-4 pt-2 bg-background">
        <TouchableOpacity
          className="bg-primary rounded-xl py-3.5 items-center"
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={isSaving || expenses.length === 0}
        >
          <Text className="text-on-primary font-cairo-bold text-base">
            {isSaving ? t('common.loading') : t('review.saveAll')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Picker Bottom Sheet */}
      <BottomSheet
        visible={categoryPickerIndex !== null}
        onClose={() => setCategoryPickerIndex(null)}
        title={t('review.categoryPicker')}
      >
        <View className="gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected =
              categoryPickerIndex !== null && expenses[categoryPickerIndex]?.mainCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                className={cn(
                  'rounded-xl px-4 py-3',
                  isSelected ? 'bg-primary-container' : 'bg-surface-bright',
                )}
                activeOpacity={0.7}
                onPress={() => {
                  if (categoryPickerIndex !== null) {
                    updateExpense(expenses[categoryPickerIndex].localId, {
                      mainCategory: cat,
                    });
                    setCategoryPickerIndex(null);
                  }
                }}
              >
                <Text
                  className={cn(
                    'font-cairo',
                    isSelected ? 'text-on-primary-container' : 'text-on-surface',
                  )}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
