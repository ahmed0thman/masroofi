import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllCategories, createCategory, type CategoryRow } from '@/db/category-repo';
import { getAllItems, createItem, type ItemRow } from '@/db/item-repo';
import { getAllMerchants, createMerchant, type MerchantRow } from '@/db/merchant-repo';
import type { ExpenseRow } from '@/schemas';
import { useThemeColors } from '@/styles/global';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { cn } from '@/lib/utils';

interface EditExpenseSheetProps {
  visible: boolean;
  expense: ExpenseRow | null;
  onClose: () => void;
  onSave: (id: number, data: Partial<ExpenseRow>) => void;
}

export function EditExpenseSheet({ visible, expense, onClose, onSave }: EditExpenseSheetProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();

  const [items, setItems] = useState<ItemRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [merchants, setMerchants] = useState<MerchantRow[]>([]);

  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [itemName, setItemName] = useState('');
  const [customItem, setCustomItem] = useState('');

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const [selectedMerchantId, setSelectedMerchantId] = useState<number | null>(null);
  const [merchantName, setMerchantName] = useState('');
  const [customMerchant, setCustomMerchant] = useState('');

  const [price, setPrice] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');

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
      }
    })();
  }, []);

  useEffect(() => {
    if (expense) {
      setPrice(String(expense.price));
      setSubCategory(expense.sub_category_name ?? '');
      setDescription(expense.description);

      // Initialize Item
      const itemRecord = items.find((i) => i.id === expense.item_id);
      if (itemRecord) {
        setSelectedItemId(itemRecord.id);
        setItemName(itemRecord.name);
        setCustomItem('');
      } else if (expense.item_name === t('recordings.other') || !itemRecord) {
        const otherItem = items.find((i) => i.name === t('recordings.other'));
        setSelectedItemId(otherItem?.id ?? null);
        setItemName(t('recordings.other'));
        setCustomItem(expense.item_name === t('recordings.other') ? '' : expense.item_name);
      }

      // Initialize Category
      const catRecord = categories.find((c) => c.id === expense.category_id);
      if (catRecord) {
        setSelectedCategoryId(catRecord.id);
        setCategoryName(catRecord.name);
        setCustomCategory('');
      } else if (expense.category_name === t('recordings.other') || !catRecord) {
        const otherCat = categories.find((c) => c.name === t('recordings.other'));
        setSelectedCategoryId(otherCat?.id ?? null);
        setCategoryName(t('recordings.other'));
        setCustomCategory(expense.category_name === t('recordings.other') ? '' : expense.category_name);
      }

      // Initialize Merchant
      const merchRecord = merchants.find((m) => m.id === expense.merchant_id);
      if (merchRecord) {
        setSelectedMerchantId(merchRecord.id);
        setMerchantName(merchRecord.name);
        setCustomMerchant('');
      } else if (expense.merchant_name === t('recordings.other') || !merchRecord) {
        const otherMerch = merchants.find((m) => m.name === t('recordings.other'));
        setSelectedMerchantId(otherMerch?.id ?? null);
        setMerchantName(t('recordings.other'));
        setCustomMerchant(expense.merchant_name === t('recordings.other') ? '' : expense.merchant_name);
      }
    }
  }, [expense, items, categories, merchants]);

  const handleItemSelect = (_value: ItemRow[keyof ItemRow], item: ItemRow) => {
    setSelectedItemId(item.id);
    setItemName(item.name);
    if (item.name !== t('recordings.other')) {
      setCustomItem('');
    }
  };

  const handleItemCreate = async (name: string) => {
    try {
      const id = await createItem({
        name,
        category_id: selectedCategoryId,
        merchant_id: selectedMerchantId,
        priority: 'normal',
      });
      const newItem: ItemRow = {
        id,
        name,
        name_variants: null,
        canonical_item_id: null,
        category_id: selectedCategoryId,
        sub_category_id: null,
        merchant_id: selectedMerchantId,
        priority: 'normal',
        is_active: 1,
      };
      setItems((prev) => [...prev, newItem]);
      setSelectedItemId(id);
      setItemName(name);
      setCustomItem('');
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleCategorySelect = (_value: CategoryRow[keyof CategoryRow], item: CategoryRow) => {
    setSelectedCategoryId(item.id);
    setCategoryName(item.name);
    if (item.name !== t('recordings.other')) {
      setCustomCategory('');
    }
  };

  const handleCategoryCreate = async (name: string) => {
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
      setSelectedCategoryId(id);
      setCategoryName(name);
      setCustomCategory('');
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleMerchantSelect = (_value: MerchantRow[keyof MerchantRow], item: MerchantRow) => {
    setSelectedMerchantId(item.id);
    setMerchantName(item.name);
    if (item.name !== t('recordings.other')) {
      setCustomMerchant('');
    }
  };

  const handleMerchantCreate = async (name: string) => {
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
      setSelectedMerchantId(id);
      setMerchantName(name);
      setCustomMerchant('');
    } catch (error) {
      console.error('Failed to create merchant:', error);
    }
  };

  const handleSave = async () => {
    if (!expense) return;

    let finalCategoryId = selectedCategoryId;
    let finalMerchantId = selectedMerchantId;
    let finalItemId = selectedItemId;
    let finalItemName = itemName;

    if (categoryName === t('recordings.other') && customCategory.trim()) {
      finalCategoryId = await createCategory({ name: customCategory.trim() });
    }

    if (merchantName === t('recordings.other') && customMerchant.trim()) {
      finalMerchantId = await createMerchant({
        name: customMerchant.trim(),
        name_variants: [customMerchant.trim()],
      });
    }

    if (itemName === t('recordings.other') && customItem.trim()) {
      finalItemId = await createItem({
        name: customItem.trim(),
        category_id: finalCategoryId,
        merchant_id: finalMerchantId,
        priority: 'normal',
      });
      finalItemName = customItem.trim();
    }

    onSave(expense.id, {
      item_id: finalItemId,
      item_name: finalItemName,
      category_id: finalCategoryId,
      merchant_id: finalMerchantId,
      price: parseFloat(price) || 0,
      description,
      sub_category_name: subCategory,
    });
  };

  const inputClass = 'border-outline-variant bg-surface rounded-lg px-4';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('common.edit')}>
      <KeyboardAwareScrollView
        style={{ paddingBottom: bottom }}
        className="max-h-125"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4">
          <View>
            <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
              {t('review.item')}
            </Text>
            <SearchableSelect
              items={items}
              displayKey="name"
              valueKey="id"
              placeholder={t('review.item')}
              selectedValue={selectedItemId}
              selectedItem={items.find((i) => i.id === selectedItemId) || null}
              onSelect={handleItemSelect}
              onCreateNew={handleItemCreate}
              createNewLabel={t('common.addNew')}
            />
            {itemName === t('recordings.other') && (
              <Input
                className={cn(inputClass, 'mt-2')}
                value={customItem}
                onChangeText={setCustomItem}
                placeholder={t('recordings.customItemPlaceholder')}
              />
            )}
          </View>

          <View>
            <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
              {t('review.price')}
            </Text>
            <Input
              className={inputClass}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          <View>
            <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
              {t('review.category')}
            </Text>
            <SearchableSelect
              items={categories}
              displayKey="name"
              valueKey="id"
              placeholder={t('recordings.category')}
              selectedValue={selectedCategoryId}
              selectedItem={categories.find((c) => c.id === selectedCategoryId) || null}
              onSelect={handleCategorySelect}
              onCreateNew={handleCategoryCreate}
              createNewLabel={t('common.addNew')}
            />
            {categoryName === t('recordings.other') && (
              <Input
                className={cn(inputClass, 'mt-2')}
                value={customCategory}
                onChangeText={setCustomCategory}
                placeholder={t('recordings.customCategoryPlaceholder')}
              />
            )}
          </View>

          <View>
            <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
              {t('review.subCategory')}
            </Text>
            <Input className={inputClass} value={subCategory} onChangeText={setSubCategory} />
          </View>

          <View>
            <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
              {t('review.merchant')}
            </Text>
            <SearchableSelect
              items={merchants}
              displayKey="name"
              valueKey="id"
              placeholder={t('review.merchant')}
              selectedValue={selectedMerchantId}
              selectedItem={merchants.find((m) => m.id === selectedMerchantId) || null}
              onSelect={handleMerchantSelect}
              onCreateNew={handleMerchantCreate}
              createNewLabel={t('common.addNew')}
            />
            {merchantName === t('recordings.other') && (
              <Input
                className={cn(inputClass, 'mt-2')}
                value={customMerchant}
                onChangeText={setCustomMerchant}
                placeholder={t('recordings.customMerchantPlaceholder')}
              />
            )}
          </View>

          <View>
            <Text className="font-cairo-semibold text-sm text-on-surface mb-1">
              {t('review.description')}
            </Text>
            <Input
              className={inputClass}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
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
      </KeyboardAwareScrollView>
    </BottomSheet>
  );
}
