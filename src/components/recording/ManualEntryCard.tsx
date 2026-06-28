import { BottomSheet } from '@/components/BottomSheet';
import { PendingEntriesList } from '@/components/PendingEntriesList';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Text as UIText } from '@/components/ui/text';
import type { CategoryRow } from '@/db/category-repo';
import { createCategory, getAllCategories } from '@/db/category-repo';
import { insertExpenses, type NewExpense } from '@/db/expense-repo';
import type { ItemRow } from '@/db/item-repo';
import { createItem, getAllItems } from '@/db/item-repo';
import type { MerchantRow } from '@/db/merchant-repo';
import { createMerchant, getAllMerchants } from '@/db/merchant-repo';
import { cn } from '@/lib/utils';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ManualForm {
  item: string;
  itemId: number | null;
  price: string;
  categoryId: number | null;
  categoryName: string;
  customCategory: string;
  customItem: string;
  customMerchant: string;
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
  categoryId: null,
  categoryName: '',
  customCategory: '',
  customItem: '',
  customMerchant: '',
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
  const [entries, setEntries] = useState<
    (NewExpense & { customItem?: string; customCategory?: string; customMerchant?: string })[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [merchants, setMerchants] = useState<MerchantRow[]>([]);
  console.log({ categories, items });
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
      } catch (error) {
        console.error('Failed to load reference data:', error);
      } finally {
        setIsLoadingData(false);
      }
    })();
  }, []);

  const handleItemSelect = (_value: ItemRow[keyof ItemRow], item: ItemRow) => {
    // const category = categories.find((c) => c.id === item.category_id);
    // const merchant = merchants.find((m) => m.id === item.merchant_id);
    setForm((prev) => ({
      ...prev,
      itemId: item.id,
      item: item.name,
      // categoryId: item.category_id ?? prev.categoryId,
      // categoryName: category?.name ?? prev.categoryName,
      // merchantId: item.merchant_id ?? prev.merchantId,
      // merchantName: merchant?.name ?? prev.merchantName,
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
    if (form.item === t('recordings.other') && !form.customItem.trim()) {
      Alert.alert(t('recordings.recordFormErrors.inComplete'), t('recordings.customItemRequired'));
      return;
    }
    if (form.categoryName === t('recordings.other') && !form.customCategory.trim()) {
      Alert.alert(
        t('recordings.recordFormErrors.inComplete'),
        t('recordings.customCategoryRequired'),
      );
      return;
    }
    if (form.merchantName === t('recordings.other') && !form.customMerchant.trim()) {
      Alert.alert(
        t('recordings.recordFormErrors.inComplete'),
        t('recordings.customMerchantRequired'),
      );
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
        item_name: form.item === t('recordings.other') ? form.customItem.trim() : form.item.trim(),
        price,
        category_id: form.categoryId,
        item_id: form.itemId,
        merchant_id: form.merchantId,
        description: form.description,
        source: 'manual',
        priority: form.priority || 'normal',
        customItem: form.item === t('recordings.other') ? form.customItem : undefined,
        customCategory:
          form.categoryName === t('recordings.other') ? form.customCategory : undefined,
        customMerchant:
          form.merchantName === t('recordings.other') ? form.customMerchant : undefined,
      } as any,
    ]);
    setForm(EMPTY_FORM);
  };

  const handleSaveAll = async () => {
    const allPendingEntries = [...entries];
    if (form.item.trim() && form.price.trim() && Number(form.price) > 0) {
      allPendingEntries.push({
        item_name: form.item === t('recordings.other') ? form.customItem.trim() : form.item.trim(),
        price: Number(form.price),
        category_id: form.categoryId,
        item_id: form.itemId,
        merchant_id: form.merchantId,
        description: form.description,
        source: 'manual',
        priority: form.priority || 'normal',
        customItem: form.item === t('recordings.other') ? form.customItem : undefined,
        customCategory:
          form.categoryName === t('recordings.other') ? form.customCategory : undefined,
        customMerchant:
          form.merchantName === t('recordings.other') ? form.customMerchant : undefined,
      } as any);
    }
    if (allPendingEntries.length === 0) return;
    setIsSaving(true);
    try {
      const resolvedEntries: NewExpense[] = [];
      for (const entry of allPendingEntries) {
        let categoryId = entry.category_id;
        let merchantId = entry.merchant_id;
        let itemId = entry.item_id;
        let itemName = entry.item_name;

        if (entry.customCategory) {
          categoryId = await createCategory({ name: entry.customCategory });
        }
        if (entry.customMerchant) {
          merchantId = await createMerchant({
            name: entry.customMerchant,
            name_variants: [entry.customMerchant],
          });
        }
        if (entry.customItem) {
          itemId = await createItem({
            name: entry.customItem,
            category_id: categoryId,
            merchant_id: merchantId,
            priority: entry.priority || 'normal',
          });
          itemName = entry.customItem;
        }

        resolvedEntries.push({
          ...entry,
          category_id: categoryId,
          merchant_id: merchantId,
          item_id: itemId,
          item_name: itemName,
          customItem: undefined,
          customCategory: undefined,
          customMerchant: undefined,
        } as NewExpense);
      }

      await insertExpenses(resolvedEntries);
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
    setForm({
      item: entry.customItem ? t('recordings.other') : entry.item_name,
      itemId: entry.item_id ?? null,
      price: String(entry.price),
      categoryId: entry.category_id ?? null,
      categoryName: entry.customCategory
        ? t('recordings.other')
        : (categories.find((c) => c.id === entry.category_id)?.name ?? ''),
      customCategory: entry.customCategory ?? '',
      customItem: entry.customItem ?? '',
      customMerchant: entry.customMerchant ?? '',
      subCategory: '',
      merchantId: entry.merchant_id ?? null,
      merchantName: entry.customMerchant
        ? t('recordings.other')
        : (merchants.find((m) => m.id === entry.merchant_id)?.name ?? ''),
      description: entry.description ?? '',
      priority: 'normal',
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
        {isLoadingData ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <KeyboardAwareScrollView
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
                createNewLabel={t('common.addNew')}
                searchThreshold={1}
              />
              {form.item === t('recordings.other') && (
                <Input
                  value={form.customItem}
                  onChangeText={(text) => setForm((p) => ({ ...p, customItem: text }))}
                  placeholder={t('recordings.customItemPlaceholder')}
                />
              )}

              <Input
                value={form.price}
                onChangeText={(text) =>
                  setForm((p) => ({ ...p, price: text.replace(/[^0-9]/g, '') }))
                }
                keyboardType="number-pad"
                placeholder={t('review.price')}
              />

              <SearchableSelect
                items={categories}
                displayKey="name"
                valueKey="id"
                placeholder={t('recordings.category')}
                selectedValue={form.categoryId}
                selectedItem={categories.find((c) => c.id === form.categoryId) || null}
                onSelect={handleCategorySelect}
                onCreateNew={handleCreateCategory}
                createNewLabel={t('common.addNew')}
                searchThreshold={1}
              />
              {form.categoryName === t('recordings.other') && (
                <Input
                  value={form.customCategory}
                  onChangeText={(text) => setForm((p) => ({ ...p, customCategory: text }))}
                  placeholder={t('recordings.customCategoryPlaceholder')}
                />
              )}

              <Input
                value={form.subCategory}
                onChangeText={(text) => setForm((p) => ({ ...p, subCategory: text }))}
                placeholder={t('review.subCategory')}
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
                createNewLabel={t('common.addNew')}
                searchThreshold={1}
              />
              {form.merchantName === t('recordings.other') && (
                <Input
                  value={form.customMerchant}
                  onChangeText={(text) => setForm((p) => ({ ...p, customMerchant: text }))}
                  placeholder={t('recordings.customMerchantPlaceholder')}
                />
              )}

              <Input
                className="min-h-[60]"
                value={form.description}
                onChangeText={(text) => setForm((p) => ({ ...p, description: text }))}
                placeholder={t('review.description')}
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
          </KeyboardAwareScrollView>
        )}
      </BottomSheet>
    </>
  );
}
