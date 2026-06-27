import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/ui/button';
import type { ExpenseRow } from '@/db/expense-repo';
import { getAllCategories, type CategoryRow } from '@/db/category-repo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EditExpenseSheetProps {
  visible: boolean;
  expense: ExpenseRow | null;
  onClose: () => void;
  onSave: (id: number, data: any) => void;
}

export function EditExpenseSheet({ visible, expense, onClose, onSave }: EditExpenseSheetProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (expense) {
      setItem(expense.item_name);
      setPrice(String(expense.price));
      setCurrency(expense.currency_symbol ?? expense.currency_code ?? '');
      setMainCategory(expense.category_name ?? '');
      setSubCategory(expense.sub_category_name ?? '');
      setMerchant(expense.merchant_name ?? '');
      setDescription(expense.description);
    }
  }, [expense]);

  const handleSave = () => {
    if (!expense) return;
    onSave(expense.id, {
      item_name: item,
      price: parseFloat(price) || 0,
      description,
    });
  };

  const inputClass =
    'border border-outline-variant rounded-lg px-4 py-3 font-cairo text-on-surface bg-surface';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('common.edit')}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ paddingBottom: bottom }}
          className="max-h-125"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-4">
            <View>
              <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
                {t('review.item')}
              </Text>
              <TextInput
                className={inputClass}
                value={item}
                onChangeText={setItem}
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
                  {t('review.price')}
                </Text>
                <TextInput
                  className={inputClass}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View className="flex-1">
                <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
                  {t('review.currency')}
                </Text>
                <TextInput
                  className={inputClass}
                  value={currency}
                  onChangeText={setCurrency}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>

            <View>
              <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
                {t('review.category')}
              </Text>
              <View className="border border-outline-variant rounded-lg overflow-hidden">
                <Picker
                  selectedValue={mainCategory}
                  onValueChange={setMainCategory}
                  style={{ color: colors.onSurface }}
                >
                  {categories.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.name} value={cat.name} color={colors.onSurface} />
                  ))}
                </Picker>
              </View>
            </View>

            <View>
              <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
                {t('review.subCategory')}
              </Text>
              <TextInput
                className={inputClass}
                value={subCategory}
                onChangeText={setSubCategory}
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View>
              <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
                {t('review.merchant')}
              </Text>
              <TextInput
                className={inputClass}
                value={merchant}
                onChangeText={setMerchant}
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View>
              <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
                {t('review.description')}
              </Text>
              <TextInput
                className={inputClass}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View className="flex-row gap-3 pt-2">
              <View className="flex-1">
                <Button variant="outline" onPress={onClose} className="w-full">
                  {t('common.cancel')}
                </Button>
              </View>
              <View className="flex-1">
                <Button onPress={handleSave} className="w-full">
                  {t('common.save')}
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}
