import { BottomSheet } from '@/components/BottomSheet';
import SafeAreaView from '@/components/layout/SafeAreaView';
import { ReviewList } from '@/components/review/ReviewList';
import { insertExpense } from '@/db/expense-repo';
import { getAllCategories, type CategoryRow } from '@/db/category-repo';
import {
  clearPendingExpenses,
  getPendingExpenses,
  isPendingLoading,
  subscribe,
} from '@/lib/pending-expenses';
import { cn } from '@/lib/utils';
import type { ExpenseRecord } from '@/services/gemini';
import { useThemeColors } from '@/styles/global';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface EditableExpense extends ExpenseRecord {
  localId: number;
}

let nextLocalId = 0;

export default function ReviewScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();
  const [expenses, setExpenses] = useState<EditableExpense[]>([]);
  const [loading, setLoading] = useState(() => isPendingLoading());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [categoryPickerIndex, setCategoryPickerIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => {});
    const pending = getPendingExpenses();
    if (pending.length > 0) {
      setExpenses(
        pending.map((exp) => ({
          ...exp,
          localId: nextLocalId++,
        })),
      );
      setLoading(false);
      return;
    }
    const unsub = subscribe(() => {
      const records = getPendingExpenses();
      setExpenses(
        records.map((exp) => ({
          ...exp,
          localId: nextLocalId++,
        })),
      );
      setLoading(false);
    });
    return unsub;
  }, []);

  const updateExpense = useCallback(
    (localId: number, updates: Partial<ExpenseRecord>) => {
      setExpenses((prev) =>
        prev.map((exp) => (exp.localId === localId ? { ...exp, ...updates } : exp)),
      );
    },
    [],
  );

  const handleEdit = useCallback(
    (localId: number) => {
      const idx = expenses.findIndex((e) => e.localId === localId);
      setEditingIndex(idx);
    },
    [expenses],
  );

  const handleSaveCard = useCallback(
    (localId: number, updates: Partial<ExpenseRecord>) => {
      setExpenses((prev) =>
        prev.map((e) => (e.localId === localId ? { ...e, ...updates } : e)),
      );
      setEditingIndex(null);
    },
    [],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
  }, []);

  const handleDelete = useCallback(
    (localId: number) => {
      setExpenses((prev) => prev.filter((e) => e.localId !== localId));
      setEditingIndex(null);
    },
    [],
  );

  const handleCategoryPress = useCallback(
    (localId: number) => {
      const idx = expenses.findIndex((e) => e.localId === localId);
      setCategoryPickerIndex(idx);
    },
    [expenses],
  );

  const handleSave = async () => {
    if (expenses.length === 0) return;
    setIsSaving(true);
    try {
      for (const exp of expenses) {
        await insertExpense({
          item_name: exp.item,
          price: exp.price,
          currency_id: 1,
          description: exp.description,
          merchant_id: exp.matchedMerchantId,
          item_id: exp.matchedItemId,
          category_id: exp.matchedCategoryId,
          sub_category_id: exp.matchedSubCategoryId,
          confidence: exp.confidence,
          transcript_id: null,
          source: 'voice',
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

  // Loading state: waiting for transcription/extraction
  if (loading) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1 justify-center items-center px-8">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-on-surface font-cairo-bold text-lg mt-6 text-center">
            {t('recordings.transcribing')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        automaticallyAdjustKeyboardInsets
        nestedScrollEnabled
      >
        <ReviewList
          expenses={expenses}
          editingIndex={editingIndex}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSaveCard={handleSaveCard}
          onCancelEdit={handleCancelEdit}
          onCategoryPress={handleCategoryPress}
          colors={colors}
          t={t}
        />
        <View className="h-48" />
      </ScrollView>

      {/* Save All Button */}
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
          {categories.map((cat) => {
            const expense =
              categoryPickerIndex !== null ? expenses[categoryPickerIndex] : null;
            const isSelected = expense?.mainCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id}
                className={cn(
                  'rounded-xl px-4 py-3',
                  isSelected ? 'bg-primary-container' : 'bg-surface-bright',
                )}
                activeOpacity={0.7}
                onPress={() => {
                  if (expense) {
                    updateExpense(expense.localId, {
                      mainCategory: cat.name,
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
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
