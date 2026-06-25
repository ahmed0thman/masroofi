import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Text,
  TextInput,
  Alert,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import SafeAreaView from '@/components/layout/SafeAreaView';
import { useRecordings, MAX_DAILY_RECORDINGS } from '@/hooks/useRecordings';
import { setPendingExpenses } from '@/lib/pending-expenses';
import { insertExpenses, type NewExpense } from '@/db/expense-repo';
import { BottomSheet } from '@/components/BottomSheet';
import { Text as UIText } from '@/components/ui/text';
import { cn } from '@/lib/utils';

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
  subCategory: string;
  merchant: string;
  description: string;
}

const EMPTY_FORM: ManualForm = {
  item: '',
  price: '',
  currency: 'جنيه',
  category: '',
  subCategory: '',
  merchant: '',
  description: '',
};

export default function Record() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();
  const hasNavigated = useRef(false);
  const [showManualSheet, setShowManualSheet] = useState(false);
  const [form, setForm] = useState<ManualForm>(EMPTY_FORM);
  const [entries, setEntries] = useState<NewExpense[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const {
    isRecording,
    handleRecordingToggle,
    recorderState,
    isTranscribing,
    transcriptionResult,
    expenseRecords,
    isExtracting,
    todayCount,
  } = useRecordings();
  const atDailyLimit = todayCount >= MAX_DAILY_RECORDINGS;

  const handleAddEntry = () => {
    if (!form.item.trim()) {
      Alert.alert(t('common.error'), t('recordings.manualItemRequired'));
      return;
    }
    const price = Number(form.price);
    if (!form.price.trim() || isNaN(price) || price <= 0) {
      Alert.alert(t('common.error'), t('recordings.manualPriceRequired'));
      return;
    }
    setEntries((prev) => [
      ...prev,
      {
        item: form.item.trim(),
        price,
        currency: form.currency || 'جنيه',
        main_category: form.category || 'أخرى',
        sub_category: form.subCategory,
        merchant: form.merchant.trim() || null,
        description: form.description,
        confidence: 1,
      },
    ]);
    setForm(EMPTY_FORM);
  };

  const handleSaveAll = async () => {
    if (entries.length === 0) return;
    setIsSaving(true);
    try {
      await insertExpenses(entries);
      setEntries([]);
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

  // Navigate to review screen when extraction completes
  useEffect(() => {
    if (expenseRecords.length > 0 && !hasNavigated.current) {
      hasNavigated.current = true;
      setPendingExpenses(expenseRecords);
      router.push('/review');
    }
  }, [expenseRecords, router]);

  // Reset navigation guard when a new extraction starts
  useEffect(() => {
    if (isExtracting) {
      hasNavigated.current = false;
    }
  }, [isExtracting]);

  return (
    <SafeAreaView className="bg-background flex-1 w-full">
      <View className="flex-1 gap-4">
        <View className="justify-center items-center pb-4 border-b border-border">
          <TouchableOpacity
            className={cn(
              'rounded-full w-20 h-20 items-center justify-center',
              atDailyLimit ? 'bg-muted' : 'bg-primary',
            )}
            activeOpacity={0.8}
            onPress={handleRecordingToggle}
            disabled={atDailyLimit && !isRecording}
          >
            {isRecording ? (
              <Ionicons name="stop" size={36} color={colors.onPrimary} />
            ) : (
              <Ionicons name="mic" size={36} color={colors.onPrimary} />
            )}
          </TouchableOpacity>
          {isRecording ? (
            <View className="mt-2 items-center">
              <Text className="text-sm text-on-surface font-cairo-semibold">
                {t('recordings.seconds', {
                  count: Math.floor(recorderState.durationMillis / 1000),
                })}
                {' / '}
                {t('recordings.maxDuration')}
              </Text>
            </View>
          ) : atDailyLimit ? (
            <View className="mt-2 items-center">
              <Text className="text-sm text-destructive font-cairo-semibold text-center">
                {t('recordings.dailyLimit')}
              </Text>
            </View>
          ) : (
            <Text className="text-sm text-muted-foreground text-center mt-2 font-cairo">
              {t('home.tapToRecord')}
            </Text>
          )}
          {!isRecording && !atDailyLimit && (
            <Text className="text-xs text-muted-foreground text-center mt-1 font-cairo">
              {t('recordings.remaining', { count: MAX_DAILY_RECORDINGS - todayCount })}
            </Text>
          )}
        </View>

        <ScrollView className="flex-1  pb-8" showsVerticalScrollIndicator={false}>
          {isTranscribing ? (
            <View className="px-4 py-3 rounded-lg bg-surface-bright">
              <Text className="text-sm text-on-surface font-cairo">
                {t('recordings.transcribing')}
              </Text>
            </View>
          ) : isExtracting ? (
            <View className="items-center py-4">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="mt-2 text-sm text-muted-foreground font-cairo">
                {t('home.extractingExpense')}
              </Text>
            </View>
          ) : transcriptionResult ? (
            <View className="px-4 py-3 rounded-lg bg-surface-bright">
              <Text className="text-sm text-on-surface font-cairo">{transcriptionResult}</Text>
            </View>
          ) : (
            <View className="bg-surface-container-low rounded-2xl p-4 mx-5 mt-2">
              <View className="flex-row items-center gap-2 mb-4">
                <Ionicons name="bulb-outline" size={22} color={colors.secondary} />
                <UIText className="text-base font-cairo-bold text-on-surface">
                  {t('recordings.tips.title')}
                </UIText>
              </View>
              <View className="flex-row items-start gap-3 mb-3">
                <Ionicons name="mic-outline" size={18} color={colors.onSurfaceVariant} />
                <UIText className="text-sm text-on-surface-variant font-cairo flex-1">
                  {t('recordings.tips.itemAndPrice')}
                </UIText>
              </View>
              <View className="flex-row items-start gap-3 mb-3">
                <Ionicons name="pricetags-outline" size={18} color={colors.onSurfaceVariant} />
                <UIText className="text-sm text-on-surface-variant font-cairo flex-1">
                  {t('recordings.tips.mentionCategory')}
                </UIText>
              </View>
              <View className="flex-row items-start gap-3 mb-3">
                <Ionicons name="home-outline" size={18} color={colors.onSurfaceVariant} />
                <UIText className="text-sm text-on-surface-variant font-cairo flex-1">
                  {t('recordings.tips.mentionContext')}
                </UIText>
              </View>
              <View className="flex-row items-start gap-3 mb-3">
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color={colors.onSurfaceVariant}
                />
                <View className="bg-surface-container-high rounded-xl p-3 flex-1">
                  <UIText className="text-sm text-foreground font-cairo-semibold">
                    {t('recordings.tips.example')}
                  </UIText>
                </View>
              </View>
              <View className="flex-row items-start gap-3">
                <Ionicons name="ear-outline" size={18} color={colors.onSurfaceVariant} />
                <UIText className="text-sm text-on-surface-variant font-cairo flex-1">
                  {t('recordings.tips.avoidNoise')}
                </UIText>
              </View>
            </View>
          )}
          {!isTranscribing && !isExtracting && !transcriptionResult && (
            <View className="mx-5 mt-3">
              <TouchableOpacity
                className={cn(
                  'rounded-2xl p-4 flex-row items-center gap-3',
                  atDailyLimit
                    ? 'bg-surface-container-low'
                    : 'bg-surface-container-lowest border border-dashed border-outline/30',
                )}
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
                <View className="bg-primary rounded-full px-2.5 py-0.5">
                  <UIText className="text-xs font-cairo-bold text-on-primary">
                    {entries.length}
                  </UIText>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Manual Entry Bottom Sheet */}
        <BottomSheet
          visible={showManualSheet}
          onClose={() => setShowManualSheet(false)}
          title={t('recordings.manualEntry')}
        >
          <ScrollView className="" showsVerticalScrollIndicator={false}>
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
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    className={cn(
                      'rounded-xl px-3.5 py-2',
                      form.category === cat ? 'bg-primary' : 'bg-surface-bright',
                    )}
                    activeOpacity={0.7}
                    onPress={() =>
                      setForm((p) => ({ ...p, category: cat === p.category ? '' : cat }))
                    }
                  >
                    <UIText
                      className={cn(
                        'text-sm font-cairo',
                        form.category === cat ? 'text-on-primary' : 'text-on-surface',
                      )}
                    >
                      {cat}
                    </UIText>
                  </TouchableOpacity>
                ))}
              </View>
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
                className="bg-primary rounded-xl py-3 items-center"
                activeOpacity={0.8}
                onPress={handleAddEntry}
              >
                <UIText className="text-on-primary font-cairo-bold text-base">
                  {t('recordings.manualAdd')}
                </UIText>
              </TouchableOpacity>
            </View>

            {entries.length > 0 && (
              <View className="mt-5 gap-2">
                <UIText className="text-sm font-cairo-bold text-on-surface mb-1">
                  {t('recordings.manualPending', { count: entries.length })}
                </UIText>
                {entries.map((entry, index) => (
                  <View
                    key={index}
                    className="bg-surface-container-lowest rounded-xl p-3 flex-row items-center gap-2"
                  >
                    <View className="flex-1">
                      <UIText
                        className="text-sm font-cairo-semibold text-on-surface"
                        numberOfLines={1}
                      >
                        {entry.item}
                      </UIText>
                      <UIText className="text-xs font-cairo text-muted-foreground">
                        {entry.price} {entry.currency} · {entry.main_category}
                      </UIText>
                    </View>
                    <TouchableOpacity onPress={() => removeEntry(index)} className="p-1">
                      <Ionicons name="close-circle" size={20} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  className="bg-primary rounded-xl py-3 items-center mt-2"
                  activeOpacity={0.8}
                  onPress={handleSaveAll}
                  disabled={isSaving}
                >
                  <UIText className="text-on-primary font-cairo-bold text-base">
                    {isSaving
                      ? t('common.loading')
                      : t('recordings.manualSaveAll', { count: entries.length })}
                  </UIText>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
}
