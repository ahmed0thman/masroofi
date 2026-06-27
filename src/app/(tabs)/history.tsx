import { BottomSheet } from '@/components/BottomSheet';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import ExpenseCard from '@/components/cards/ExpenseCard';
import RecordingCard from '@/components/cards/RecordingCard';
import SafeAreaView from '@/components/layout/SafeAreaView';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { ExpenseFilters } from '@/db/expense-repo';
import { useFilteredExpenses } from '@/hooks/useFilteredExpenses';
import { useProfile } from '@/hooks/useProfile';
import { useRecordingsList } from '@/hooks/useRecordingsList';
import { cn } from '@/lib/utils';
import { useThemeColors } from '@/styles/global';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function RecordingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { recordings, isLoading, error, refresh, onDelete } = useRecordingsList();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('archive.viewRecordings')}>
      {isLoading ? (
        <View className="py-8">
          <LoadingSkeleton count={3} />
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : recordings.length === 0 ? (
        <View className="py-8 items-center">
          <Ionicons name="mic-outline" size={48} color={colors.onSurfaceVariant} />
          <Text className="text-muted-foreground text-center mt-3 font-cairo">
            {t('recordings.noRecordings')}
          </Text>
        </View>
      ) : (
        <FlatList
          style={{ marginBottom: insets.bottom }}
          data={recordings}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          className="min-h-96 border border-destructive"
          renderItem={({ item }) => <RecordingCard recording={item} onDelete={onDelete} />}
        />
      )}
    </BottomSheet>
  );
}

export default function Archive() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const { profile, refresh: refreshProfile } = useProfile();
  const {
    expenses,
    totalCount,
    isLoading,
    error,
    hasMore,
    categories,
    filters,
    applyFilters,
    loadMore,
    refresh,
  } = useFilteredExpenses();

  const [searchText, setSearchText] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showRecordings, setShowRecordings] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(null);
  const [datePickerDate, setDatePickerDate] = useState(new Date());

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      if (!initialLoadDone.current) {
        initialLoadDone.current = true;
        applyFilters({});
      } else {
        refresh();
      }
    }, [refreshProfile, applyFilters, refresh]),
  );

  const getCurrentFilters = useCallback(
    (overrides?: { search?: string; category?: number | undefined }): ExpenseFilters => {
      const f: ExpenseFilters = {};
      const effectiveSearch = overrides?.search !== undefined ? overrides.search : searchText;
      const effectiveCategory = overrides?.category !== undefined ? overrides.category : selectedCategory;
      if (effectiveSearch) f.search = effectiveSearch;
      if (effectiveCategory !== undefined) f.category_id = effectiveCategory;
      if (dateFrom) f.dateFrom = dateFrom.toISOString();
      if (dateTo) f.dateTo = dateTo.toISOString();
      if (priceMin) f.priceMin = Number(priceMin);
      if (priceMax) f.priceMax = Number(priceMax);
      return f;
    },
    [searchText, selectedCategory, dateFrom, dateTo, priceMin, priceMax],
  );

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      applyFilters(getCurrentFilters({ search: text }));
    }, 300);
  };

  const handleCategoryPress = (category: number | undefined) => {
    setSelectedCategory(category);
    applyFilters(getCurrentFilters({ category }));
  };

  const handleApplyAdvanced = () => {
    setShowAdvancedFilters(false);
    applyFilters(getCurrentFilters());
  };

  const handleResetAdvanced = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setPriceMin('');
    setPriceMax('');
    setSelectedCategory(undefined);
    setSearchText('');
    setShowAdvancedFilters(false);
    applyFilters({});
  };

  const handleDateChange = (_: DateTimePickerChangeEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(null);
      if (selectedDate) {
        if (showDatePicker === 'from') setDateFrom(selectedDate);
        else setDateTo(selectedDate);
      }
    } else {
      if (selectedDate) setDatePickerDate(selectedDate);
    }
  };

  const confirmDate = () => {
    setShowDatePicker(null);
    if (showDatePicker === 'from') setDateFrom(datePickerDate);
    else setDateTo(datePickerDate);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView className="bg-background flex-1 p-0">
      <View className="flex-1">
        <View className="flex-row items-center gap-2 px-5 py-2">
          <View className="flex-1 flex-row justify-start items-center bg-surface-container-high rounded-xl px-3 py-2.5 gap-2">
            <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
            <TextInput
              className="flex-1 font-cairo text-on-surface p-0"
              placeholder={t('archive.search')}
              placeholderTextColor={colors.onSurfaceVariant}
              value={searchText}
              onChangeText={handleSearchChange}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              'rounded-xl p-2.5',
              showAdvancedFilters ? 'bg-primary' : 'bg-surface-container-high',
            )}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={showAdvancedFilters ? colors.onPrimary : colors.onPrimary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mx-5 px-5 py-3 min-h-20 max-h-18"
        >
          <View className="flex-row gap-2">
            <Button
              variant={selectedCategory === undefined ? 'default' : 'outline'}
              size="sm"
              onPress={() => handleCategoryPress(undefined)}
              className="rounded-full min-h-3 py-1.5"
            >
              {t('archive.allCategories')}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                onPress={() => handleCategoryPress(cat.id)}
                className="rounded-full min-h-3 py-1.5"
              >
                {cat.name}
              </Button>
            ))}
          </View>
        </ScrollView>

        {showAdvancedFilters && (
          <View className="px-5 pb-3 gap-3">
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowDatePicker('from');
                  setDatePickerDate(dateFrom ?? new Date());
                }}
                className="flex-1 bg-surface-container-high rounded-xl px-3 py-2.5"
              >
                <Text
                  className={cn(
                    'font-cairo text-sm',
                    dateFrom ? 'text-on-surface' : 'text-muted-foreground',
                  )}
                >
                  {dateFrom ? formatDate(dateFrom) : t('archive.dateFrom')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowDatePicker('to');
                  setDatePickerDate(dateTo ?? new Date());
                }}
                className="flex-1 bg-surface-container-high rounded-xl px-3 py-2.5"
              >
                <Text
                  className={cn(
                    'font-cairo text-sm',
                    dateTo ? 'text-on-surface' : 'text-muted-foreground',
                  )}
                >
                  {dateTo ? formatDate(dateTo) : t('archive.dateTo')}
                </Text>
              </Pressable>
            </View>
            <View className="flex-row gap-3">
              <TextInput
                className="flex-1 text-start bg-surface-container-high rounded-xl px-3 py-2.5 font-cairo text-on-surface"
                placeholder={t('archive.priceMin')}
                placeholderTextColor={colors.onSurfaceVariant}
                value={priceMin}
                onChangeText={(text) => setPriceMin(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />
              <TextInput
                className="flex-1 text-start bg-surface-container-high rounded-xl px-3 py-2.5 font-cairo text-on-surface"
                placeholder={t('archive.priceMax')}
                placeholderTextColor={colors.onSurfaceVariant}
                value={priceMax}
                onChangeText={(text) => setPriceMax(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleApplyAdvanced}
                className="flex-1 bg-primary rounded-xl py-2.5 items-center"
              >
                <Text className="text-on-primary font-cairo-semibold">{t('archive.apply')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleResetAdvanced}
                className="flex-1 bg-surface-container-high rounded-xl py-2.5 items-center"
              >
                <Text className="text-on-surface font-cairo-semibold">{t('archive.reset')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="flex-row items-center justify-between px-5 py-2">
          <Text className="text-sm text-muted-foreground font-cairo">
            {t('archive.showing', { count: expenses.length, total: totalCount })}
          </Text>
          <TouchableOpacity
            onPress={() => setShowRecordings(true)}
            className="flex-row items-center gap-1"
          >
            <Ionicons name="mic-outline" size={16} color={colors.secondaryContainer} />
            <Text className="text-secondary font-cairo-semibold text-sm">
              {t('archive.viewRecordings')}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && expenses.length === 0 ? (
          <View className="flex-1 pt-4">
            <LoadingSkeleton count={5} />
          </View>
        ) : error ? (
          <ErrorState message={error} onRetry={() => applyFilters(filters)} />
        ) : expenses.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8">
            <Ionicons name="archive-outline" size={64} color={colors.onSurfaceVariant} />
            <Text variant="h2" className="text-center leading-8 font-cairo-bold mt-4">
              {t('archive.noResults')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
            ItemSeparatorComponent={() => <View className="h-3" />}
            ListFooterComponent={
              hasMore ? (
                isLoading ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : (
                  <TouchableOpacity onPress={loadMore} className="py-4 items-center">
                    <Text className="text-primary font-cairo-semibold">{t('common.loadMore')}</Text>
                  </TouchableOpacity>
                )
              ) : null
            }
            renderItem={({ item }) => <ExpenseCard expense={item} />}
          />
        )}
      </View>

      {showDatePicker && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/50">
          <View className="bg-surface rounded-2xl p-6 mx-8 items-center shadow-lg">
            <DateTimePicker
              value={datePickerDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              textColor={colors.onPrimary}
            />
            <View className="w-full flex-row items-center gap-3">
              {Platform.OS === 'ios' && <Button onPress={confirmDate}>{t('common.save')}</Button>}
              {Platform.OS === 'ios' && (
                <Button variant="outline" className="mt-2" onPress={() => setShowDatePicker(null)}>
                  {t('common.cancel')}
                </Button>
              )}
            </View>
          </View>
        </View>
      )}

      {showRecordings && (
        <RecordingsSheet visible={showRecordings} onClose={() => setShowRecordings(false)} />
      )}
    </SafeAreaView>
  );
}
