import type { ExpenseRecord } from '@/services/gemini';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface EditableExpense extends ExpenseRecord {
  localId: number;
}

interface ReviewEditFormProps {
  expense: EditableExpense;
  index: number;
  onSave: (localId: number, updates: Partial<ExpenseRecord>) => void;
  onCancel: (localId: number) => void;
  onCategoryPress: (localId: number) => void;
  colors: Record<string, string>;
  t: TFunction;
}

export function ReviewEditForm({
  expense,
  onSave,
  onCancel,
  onCategoryPress,
  colors,
  t,
}: ReviewEditFormProps) {
  const [item, setItem] = useState(expense.item);
  const [price, setPrice] = useState(String(expense.price));
  const [currency, setCurrency] = useState(expense.currency);
  const [subCategory, setSubCategory] = useState(expense.subCategory);
  const [merchant, setMerchant] = useState(expense.merchant ?? '');
  const [description, setDescription] = useState(expense.description);

  const handleSave = () => {
    onSave(expense.localId, {
      item,
      price: price ? Number(price) : 0,
      currency,
      subCategory,
      description,
      merchant: merchant || null,
    });
  };

  const handlePriceChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPrice(cleaned);
  };

  return (
    <View className="bg-card rounded-2xl p-4 gap-3">
      {/* Item name */}
      <View>
        <Text className="text-xs font-cairo text-muted-foreground mb-1">
          {t('review.item')}
        </Text>
        <TextInput
          className="bg-surface-bright rounded-xl px-3 py-2.5 text-on-surface font-cairo"
          value={item}
          onChangeText={setItem}
          placeholder={t('review.item')}
          placeholderTextColor={colors.mutedForeground}
        />
      </View>

      {/* Price + Currency */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="text-xs font-cairo text-muted-foreground mb-1">
            {t('review.price')}
          </Text>
          <TextInput
            className="bg-surface-bright rounded-xl px-3 py-2.5 text-on-surface font-cairo"
            value={price}
            onChangeText={handlePriceChange}
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
            value={currency}
            onChangeText={setCurrency}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
      </View>

      {/* Category (TouchableOpacity → opens bottom sheet) */}
      <View>
        <Text className="text-xs font-cairo text-muted-foreground mb-1">
          {t('review.category')}
        </Text>
        <TouchableOpacity
          className="bg-surface-bright rounded-xl px-3 py-2.5 flex-row items-center justify-between"
          activeOpacity={0.7}
          onPress={() => onCategoryPress(expense.localId)}
        >
          <Text className="text-on-surface font-cairo">{expense.mainCategory}</Text>
          <Ionicons name="chevron-down" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Sub-category */}
      <View>
        <Text className="text-xs font-cairo text-muted-foreground mb-1">
          {t('review.subCategory')}
        </Text>
        <TextInput
          className="bg-surface-bright rounded-xl px-3 py-2.5 text-on-surface font-cairo"
          value={subCategory}
          onChangeText={setSubCategory}
          placeholderTextColor={colors.mutedForeground}
        />
      </View>

      {/* Merchant */}
      <View>
        <Text className="text-xs font-cairo text-muted-foreground mb-1">
          {t('review.merchant')}
        </Text>
        <TextInput
          className="bg-surface-bright rounded-xl px-3 py-2.5 text-on-surface font-cairo"
          value={merchant}
          onChangeText={setMerchant}
          placeholderTextColor={colors.mutedForeground}
        />
      </View>

      {/* Description */}
      <View>
        <Text className="text-xs font-cairo text-muted-foreground mb-1">
          {t('review.description')}
        </Text>
        <TextInput
          className="bg-surface-bright rounded-xl px-3 py-2.5 text-on-surface font-cairo min-h-20"
          value={description}
          onChangeText={setDescription}
          placeholderTextColor={colors.mutedForeground}
          multiline
          textAlignVertical="top"
          numberOfLines={3}
        />
      </View>

      {/* Save + Cancel buttons */}
      <View className="flex-row items-center gap-3 pt-2">
        <TouchableOpacity
          className="flex-1 bg-primary rounded-xl py-2.5 items-center"
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text className="text-on-primary font-cairo-semibold">{t('common.save')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-4 py-2.5 items-center justify-center"
          activeOpacity={0.7}
          onPress={() => onCancel(expense.localId)}
        >
          <Text className="text-sm text-muted-foreground font-cairo">{t('common.cancel')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
