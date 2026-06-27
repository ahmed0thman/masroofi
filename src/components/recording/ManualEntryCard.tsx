import { useState } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text as UIText } from '@/components/ui/text';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/components/BottomSheet';
import { PendingEntriesList } from '@/components/PendingEntriesList';
import { insertExpenses, type NewExpense } from '@/db/expense-repo';
import { cn } from '@/lib/utils';
import type { TFunction } from 'i18next';

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

interface ManualForm {
  item: string;
  price: string;
  currency: string;
  category: string;
  customCategory: string;
  subCategory: string;
  merchant: string;
  description: string;
}

const EMPTY_FORM: ManualForm = {
  item: '',
  price: '',
  currency: 'جنيه',
  category: '',
  customCategory: '',
  subCategory: '',
  merchant: '',
  description: '',
};

interface ManualEntryCardProps {
  colors: Record<string, string>;
  t: TFunction;
}

export function ManualEntryCard({ colors, t }: ManualEntryCardProps) {
  const { bottom } = useSafeAreaInsets();
  const [showManualSheet, setShowManualSheet] = useState(false);
  const [form, setForm] = useState<ManualForm>(EMPTY_FORM);
  const [entries, setEntries] = useState<NewExpense[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddEntry = () => {
    if (!form.item.trim()) {
      Alert.alert(t('recordings.recordFormErrors.inComplete'), t('recordings.manualItemRequired'));
      return;
    }
    const price = Number(form.price);
    if (!form.price.trim() || isNaN(price) || price <= 0) {
      Alert.alert(t('recordings.recordFormErrors.inComplete'), t('recordings.manualPriceRequired'));
      return;
    }
    if (form.category === 'أخرى' && !form.customCategory.trim()) {
      Alert.alert(
        t('recordings.recordFormErrors.inComplete'),
        t('recordings.customCategoryRequired'),
      );
      return;
    }
    setEntries((prev) => [
      ...prev,
      {
        item: form.item.trim(),
        price,
        currency: form.currency || 'جنيه',
        main_category:
          form.category === 'أخرى' ? form.customCategory.trim() : form.category || 'أخرى',
        sub_category: form.subCategory,
        merchant: form.merchant.trim() || null,
        description: form.description,
        confidence: 1,
      },
    ]);
    setForm(EMPTY_FORM);
  };

  const handleSaveAll = async () => {
    const allEntries = [...entries];
    if (form.item.trim() && form.price.trim() && Number(form.price) > 0) {
      if (form.category === 'أخرى' && !form.customCategory.trim()) {
        Alert.alert(t('common.error'), t('recordings.customCategoryRequired'));
        return;
      }
      allEntries.push({
        item: form.item.trim(),
        price: Number(form.price),
        currency: form.currency || 'جنيه',
        main_category:
          form.category === 'أخرى' ? form.customCategory.trim() : form.category || 'أخرى',
        sub_category: form.subCategory,
        merchant: form.merchant.trim() || null,
        description: form.description,
        confidence: 1,
      });
    }
    if (allEntries.length === 0) return;
    setIsSaving(true);
    try {
      await insertExpenses(allEntries);
      setEntries([]);
      setForm(EMPTY_FORM);
      setShowManualSheet(false);
    } catch {
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditEntry = (index: number) => {
    const entry = entries[index];
    const isOther = !CATEGORIES.slice(0, -1).includes(entry.main_category);
    setForm({
      item: entry.item,
      price: String(entry.price),
      currency: entry.currency ?? 'جنيه',
      category: isOther ? 'أخرى' : entry.main_category,
      customCategory: isOther ? entry.main_category : '',
      subCategory: entry.sub_category,
      merchant: entry.merchant ?? '',
      description: entry.description,
    });
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <View className="mx-5 mt-3">
        <TouchableOpacity
          className="rounded-2xl p-4 flex-row items-center gap-3 bg-surface-container-lowest border border-dashed border-outline/30"
          activeOpacity={0.7}
          onPress={() => setShowManualSheet(true)}
        >
          <Ionicons name="create-outline" size={22} color={colors.secondary} />
          <View className="flex-1">
            <UIText className="text-base font-cairo-bold text-on-surface">
              {t('recordings.manualEntry')}
            </UIText>
            <UIText className="text-sm font-cairo text-muted-foreground mt-0.5">
              {t('recordings.manualEntryDesc')}
            </UIText>
          </View>
        </TouchableOpacity>
      </View>

      <BottomSheet
        visible={showManualSheet}
        onClose={() => setShowManualSheet(false)}
        title={t('recordings.manualEntry')}
      >
        <ScrollView
          style={{ paddingBottom: bottom }}
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-3">
            <TextInput
              className="bg-surface-bright rounded-xl px-3.5 py-3 text-on-surface font-cairo"
              value={form.item}
              onChangeText={(text) => setForm((p) => ({ ...p, item: text }))}
              placeholder={t('review.item')}
              placeholderTextColor={colors.mutedForeground}
            />
            <View className="flex-row gap-3">
              <TextInput
                className="flex-1 bg-surface-bright rounded-xl px-3.5 py-3 text-on-surface font-cairo"
                value={form.price}
                onChangeText={(text) =>
                  setForm((p) => ({ ...p, price: text.replace(/[^0-9]/g, '') }))
                }
                keyboardType="number-pad"
                placeholder={t('review.price')}
                placeholderTextColor={colors.mutedForeground}
              />
              <TextInput
                className="w-[90] bg-surface-bright rounded-xl px-3.5 py-3 text-on-surface font-cairo"
                value={form.currency}
                onChangeText={(text) => setForm((p) => ({ ...p, currency: text }))}
                placeholder={t('review.currency')}
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View className="bg-surface-bright rounded-xl overflow-hidden">
              <Picker
                selectedValue={form.category}
                onValueChange={(value) => setForm((p) => ({ ...p, category: value }))}
              >
                <Picker.Item
                  label={t('recordings.category')}
                  value=""
                  color={colors.mutedForeground}
                />
                {CATEGORIES.map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>
            {form.category === 'أخرى' && (
              <TextInput
                className="bg-surface-bright rounded-xl px-3.5 py-3 text-on-surface font-cairo"
                value={form.customCategory}
                onChangeText={(text) => setForm((p) => ({ ...p, customCategory: text }))}
                placeholder={t('recordings.customCategory')}
                placeholderTextColor={colors.mutedForeground}
              />
            )}
            <TextInput
              className="bg-surface-bright rounded-xl px-3.5 py-3 text-on-surface font-cairo"
              value={form.subCategory}
              onChangeText={(text) => setForm((p) => ({ ...p, subCategory: text }))}
              placeholder={t('review.subCategory')}
              placeholderTextColor={colors.mutedForeground}
            />
            <TextInput
              className="bg-surface-bright rounded-xl px-3.5 py-3 text-on-surface font-cairo"
              value={form.merchant}
              onChangeText={(text) => setForm((p) => ({ ...p, merchant: text }))}
              placeholder={t('review.merchant')}
              placeholderTextColor={colors.mutedForeground}
            />
            <TextInput
              className="bg-surface-bright rounded-xl px-3.5 py-3 text-on-surface font-cairo min-h-[60]"
              value={form.description}
              onChangeText={(text) => setForm((p) => ({ ...p, description: text }))}
              placeholder={t('review.description')}
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              className="flex-row items-center justify-center gap-1.5 rounded-xl border border-outline/30 px-4 py-2.5 self-end"
              activeOpacity={0.7}
              onPress={handleAddEntry}
            >
              <Ionicons name="add" size={18} color={colors.secondary} />
              <UIText className="text-secondary font-cairo-bold text-sm">
                {t('recordings.addMore')}
              </UIText>
            </TouchableOpacity>
          </View>

          <PendingEntriesList
            entries={entries}
            onEdit={handleEditEntry}
            onRemove={removeEntry}
            colors={colors}
            t={t}
          />
          <View className="mt-5">
            <TouchableOpacity
              className="bg-primary rounded-xl py-3 items-center"
              activeOpacity={0.8}
              onPress={handleSaveAll}
              disabled={
                isSaving || (entries.length === 0 && !form.item.trim() && !form.price.trim())
              }
            >
              <UIText
                className={cn(
                  'font-cairo-bold text-base',
                  entries.length === 0 && !form.item.trim() && !form.price.trim()
                    ? 'text-on-primary/50'
                    : 'text-on-primary',
                )}
              >
                {isSaving
                  ? t('common.loading')
                  : entries.length === 0 && !form.item.trim() && !form.price.trim()
                    ? t('recordings.addSomeFirst')
                    : t('recordings.manualSaveAll', {
                        count:
                          entries.length +
                          (form.item.trim() && form.price.trim() && Number(form.price) > 0
                            ? 1
                            : 0),
                      })}
              </UIText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheet>
    </>
  );
}
