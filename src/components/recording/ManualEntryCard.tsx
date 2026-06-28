import { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text as UIText } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/components/BottomSheet';
import { PendingEntriesList } from '@/components/PendingEntriesList';
import { insertExpenses, type NewExpense } from '@/db/expense-repo';
import { getAllCategories, createCategory } from '@/db/category-repo';
import { getAllItems, createItem } from '@/db/item-repo';
import { getAllMerchants, createMerchant } from '@/db/merchant-repo';
import { getAllCurrencies } from '@/db/currency-repo';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { cn } from '@/lib/utils';
import type { TFunction } from 'i18next';
import type { ItemRow } from '@/db/item-repo';
import type { CategoryRow } from '@/db/category-repo';
import type { MerchantRow } from '@/db/merchant-repo';
import type { CurrencyRow } from '@/db/currency-repo';

interface ManualForm {
  item: string;
  itemId: number | null;
  price: string;
  currencyId: number;
  categoryId: number | null;
  categoryName: string;
  customCategory: string;
  subCategory: string;
  merchantId: number | null;
  merchantName: string;
  description: string;
  priority: string;
}

const EMPTY_FORM: ManualForm = {
  item: '',
  itemId: null,
  price: '',
  currencyId: 0,
  categoryId: null,
  categoryName: '',
  customCategory: '',
  subCategory: '',
  merchantId: null,
  merchantName: '',
  description: '',
  priority: 'normal',
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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [merchants, setMerchants] = useState<MerchantRow[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [allItems, allCategories, allMerchants, allCurrencies] = await Promise.all([
          getAllItems(),
          getAllCategories(),
          getAllMerchants(),
          getAllCurrencies(),
        ]);
        setItems(allItems);
        setCategories(allCategories);
        setMerchants(allMerchants);
        setCurrencies(allCurrencies);
        const defaultCurr = allCurrencies.find((c) => c.is_default) || allCurrencies[0];
        if (defaultCurr) {
          setForm((prev) => (prev.currencyId === 0 ? { ...prev, currencyId: defaultCurr.id } : prev));
        }
      } catch (error) {
        console.error('Failed to load reference data:', error);
      } finally {
        setIsLoadingData(false);
      }
    })();
  }, []);

  const handleItemSelect = (_value: ItemRow[keyof ItemRow], item: ItemRow) => {
    const category = categories.find((c) => c.id === item.category_id);
    const merchant = merchants.find((m) => m.id === item.merchant_id);
    setForm((prev) => ({
      ...prev,
      itemId: item.id,
      item: item.name,
      categoryId: item.category_id ?? prev.categoryId,
      categoryName: category?.name ?? prev.categoryName,
      merchantId: item.merchant_id ?? prev.merchantId,
      merchantName: merchant?.name ?? prev.merchantName,
    }));
  };

  const handleCreateItem = async (name: string) => {
    try {
      const id = await createItem({
        name,
        category_id: form.categoryId,
        merchant_id: form.merchantId,
        priority: form.priority || 'normal',
      });
      const newItem: ItemRow = {
        id,
        name,
        name_variants: null,
        canonical_item_id: null,
        category_id: form.categoryId,
        sub_category_id: null,
        merchant_id: form.merchantId,
        priority: form.priority || 'normal',
        is_active: 1,
      };
      setItems((prev) => [...prev, newItem]);
      setForm((prev) => ({ ...prev, itemId: id, item: name }));
    } catch {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleCategorySelect = (_value: CategoryRow[keyof CategoryRow], item: CategoryRow) => {
    setForm((prev) => ({ ...prev, categoryId: item.id, categoryName: item.name }));
  };

  const handleCreateCategory = async (name: string) => {
    try {
      const id = await createCategory({ name });
      const newCategory: CategoryRow = {
        id,
        name,
        name_en: null,
        icon: null,
        color: null,
        default_priority: 'normal',
        sort_order: 99,
        is_active: 1,
      };
      setCategories((prev) => [...prev, newCategory]);
      setForm((prev) => ({ ...prev, categoryId: id, categoryName: name }));
    } catch {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleMerchantSelect = (_value: MerchantRow[keyof MerchantRow], item: MerchantRow) => {
    setForm((prev) => ({ ...prev, merchantId: item.id, merchantName: item.name }));
  };

  const handleCreateMerchant = async (name: string) => {
    try {
      const id = await createMerchant({ name, name_variants: [name] });
      const newMerchant: MerchantRow = {
        id,
        name,
        name_variants: JSON.stringify([name]),
        name_en: null,
        icon: null,
        color: null,
        is_active: 1,
      };
      setMerchants((prev) => [...prev, newMerchant]);
      setForm((prev) => ({ ...prev, merchantId: id, merchantName: name }));
    } catch {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

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
    setEntries((prev) => [
      ...prev,
      {
        item_name: form.item.trim(),
        price,
        currency_id: form.currencyId,
        category_id: form.categoryId,
        item_id: form.itemId,
        merchant_id: form.merchantId,
        description: form.description,
        source: 'manual',
      } as NewExpense,
    ]);
    setForm({ ...EMPTY_FORM, currencyId: form.currencyId });
  };

  const handleSaveAll = async () => {
    const allEntries = [...entries];
    if (form.item.trim() && form.price.trim() && Number(form.price) > 0) {
      allEntries.push({
        item_name: form.item.trim(),
        price: Number(form.price),
        currency_id: form.currencyId,
        category_id: form.categoryId,
        item_id: form.itemId,
        merchant_id: form.merchantId,
        description: form.description,
        source: 'manual',
      } as NewExpense);
    }
    if (allEntries.length === 0) return;
    setIsSaving(true);
    try {
      await insertExpenses(allEntries);
      setEntries([]);
      setForm({ ...EMPTY_FORM, currencyId: form.currencyId });
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
    setForm({
      item: entry.item_name,
      itemId: entry.item_id ?? null,
      price: String(entry.price),
      currencyId: entry.currency_id,
      categoryId: entry.category_id ?? null,
      categoryName: categories.find((c) => c.id === entry.category_id)?.name ?? '',
      customCategory: '',
      subCategory: '',
      merchantId: entry.merchant_id ?? null,
      merchantName: merchants.find((m) => m.id === entry.merchant_id)?.name ?? '',
      description: entry.description ?? '',
      priority: 'normal',
    });
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const selectedCurrency = currencies.find((c) => c.id === form.currencyId);

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
        {isLoadingData ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={{ paddingBottom: bottom }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-3">
              <SearchableSelect
                items={items}
                displayKey="name"
                valueKey="id"
                placeholder={t('review.item')}
                selectedValue={form.itemId}
                selectedItem={items.find((i) => i.id === form.itemId) || null}
                onSelect={handleItemSelect}
                onCreateNew={handleCreateItem}
                searchThreshold={1}
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
                <View className="w-[110]">
                  <SearchableSelect
                    items={currencies}
                    displayKey="code"
                    valueKey="id"
                    placeholder={t('review.currency')}
                    selectedValue={form.currencyId}
                    selectedItem={selectedCurrency || null}
                    onSelect={(value) => setForm((p) => ({ ...p, currencyId: value as number }))}
                    searchThreshold={0}
                    showCreateNew={false}
                    maxResults={10}
                  />
                </View>
              </View>

              <SearchableSelect
                items={categories}
                displayKey="name"
                valueKey="id"
                placeholder={t('recordings.category')}
                selectedValue={form.categoryId}
                selectedItem={categories.find((c) => c.id === form.categoryId) || null}
                onSelect={handleCategorySelect}
                onCreateNew={handleCreateCategory}
                searchThreshold={1}
              />

              <TextInput
                className="bg-surface-bright rounded-xl px-3.5 py-3 text-on-surface font-cairo"
                value={form.subCategory}
                onChangeText={(text) => setForm((p) => ({ ...p, subCategory: text }))}
                placeholder={t('review.subCategory')}
                placeholderTextColor={colors.mutedForeground}
              />

              <SearchableSelect
                items={merchants}
                displayKey="name"
                valueKey="id"
                placeholder={t('review.merchant')}
                selectedValue={form.merchantId}
                selectedItem={merchants.find((m) => m.id === form.merchantId) || null}
                onSelect={handleMerchantSelect}
                onCreateNew={handleCreateMerchant}
                searchThreshold={1}
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
        )}
      </BottomSheet>
    </>
  );
}
