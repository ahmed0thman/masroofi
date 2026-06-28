import type { ExpenseRecord, EditableExpense } from '@/schemas';
import { getAllItems } from '@/db/item-repo';
import { getAllCategories } from '@/db/category-repo';
import { getAllMerchants } from '@/db/merchant-repo';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { ItemRow } from '@/db/item-repo';
import type { CategoryRow } from '@/db/category-repo';
import type { MerchantRow } from '@/db/merchant-repo';

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
  colors,
  t,
}: ReviewEditFormProps) {
  const [item, setItem] = useState(expense.item);
  const [price, setPrice] = useState(String(expense.price));
  const [currency, setCurrency] = useState(expense.currency);
  const [subCategory, setSubCategory] = useState(expense.subCategory);
  const [merchant, setMerchant] = useState(expense.merchant ?? '');
  const [description, setDescription] = useState(expense.description);

  const [items, setItems] = useState<ItemRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [merchants, setMerchants] = useState<MerchantRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [selectedItemId, setSelectedItemId] = useState<number | null>(expense.matchedItemId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(expense.matchedCategoryId);
  const [selectedMerchantId, setSelectedMerchantId] = useState<number | null>(expense.matchedMerchantId);

  useEffect(() => {
    (async () => {
      try {
        const [allItems, allCategories, allMerchants] = await Promise.all([
          getAllItems(),
          getAllCategories(),
          getAllMerchants(),
        ]);
        setItems(allItems);
        setCategories(allCategories);
        setMerchants(allMerchants);

        if (!expense.matchedCategoryId && expense.mainCategory) {
          const found = allCategories.find((c) => c.name === expense.mainCategory);
          if (found) setSelectedCategoryId(found.id);
        }
        if (!expense.matchedItemId && expense.item) {
          const found = allItems.find((i) => i.name === expense.item);
          if (found) setSelectedItemId(found.id);
        }
        if (!expense.matchedMerchantId && expense.merchant) {
          const found = allMerchants.find((m) => m.name === expense.merchant);
          if (found) setSelectedMerchantId(found.id);
        }
      } catch (error) {
        console.error('Failed to load reference data:', error);
      } finally {
        setIsLoadingData(false);
      }
    })();
  }, []);

  const handleSave = () => {
    const selectedItem = items.find((i) => i.id === selectedItemId);
    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
    const selectedMerchant = merchants.find((m) => m.id === selectedMerchantId);

    onSave(expense.localId, {
      item: selectedItem?.name || item,
      price: price ? Number(price) : 0,
      currency,
      mainCategory: selectedCategory?.name || expense.mainCategory,
      subCategory,
      description,
      merchant: selectedMerchant?.name || merchant || null,
      matchedItemId: selectedItemId,
      matchedMerchantId: selectedMerchantId,
      matchedCategoryId: selectedCategoryId,
    });
  };

  const handlePriceChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPrice(cleaned);
  };

  if (isLoadingData) {
    return (
      <View className="bg-card rounded-2xl p-4 items-center py-8">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="bg-card rounded-2xl p-4 gap-3">
      {/* Item name */}
      <View>
        <Text className="text-xs font-cairo text-muted-foreground mb-1">
          {t('review.item')}
        </Text>
        <SearchableSelect
          items={items}
          displayKey="name"
          valueKey="id"
          placeholder={t('review.item')}
          selectedValue={selectedItemId}
          selectedItem={items.find((i) => i.id === selectedItemId) || null}
          onSelect={(value, item) => {
            setSelectedItemId(value as number | null);
            setItem(item.name);
          }}
          searchThreshold={1}
          showCreateNew={false}
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

      {/* Category */}
      <View>
        <Text className="text-xs font-cairo text-muted-foreground mb-1">
          {t('review.category')}
        </Text>
        <SearchableSelect
          items={categories}
          displayKey="name"
          valueKey="id"
          placeholder={t('review.category')}
          selectedValue={selectedCategoryId}
          selectedItem={categories.find((c) => c.id === selectedCategoryId) || null}
          onSelect={(value) => {
            setSelectedCategoryId(value as number | null);
          }}
          searchThreshold={1}
          showCreateNew={false}
        />
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
        <SearchableSelect
          items={merchants}
          displayKey="name"
          valueKey="id"
          placeholder={t('review.merchant')}
          selectedValue={selectedMerchantId}
          selectedItem={merchants.find((m) => m.id === selectedMerchantId) || null}
          onSelect={(value, item) => {
            setSelectedMerchantId(value as number | null);
            setMerchant(item.name);
          }}
          searchThreshold={1}
          showCreateNew={false}
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
