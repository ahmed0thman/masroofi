import { View, TouchableOpacity, ScrollView, ActivityIndicator, Text } from 'react-native';
import React, { useEffect, useRef } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import SafeAreaView from '@/components/layout/SafeAreaView';
import { useRecordings, MAX_DAILY_RECORDINGS } from '@/hooks/useRecordings';
import { setPendingExpenses } from '@/lib/pending-expenses';
import { cn } from '@/lib/utils';

export default function Record() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();
  const hasNavigated = useRef(false);
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
      <View className="flex-1">
        <View className="flex-1 justify-center items-center">
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
                {t('recordings.seconds', { count: Math.floor(recorderState.durationMillis / 1000) })}
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
                <Text className="text-base font-cairo-bold text-on-surface">
                  {t('recordings.tips.title')}
                </Text>
              </View>
              <View className="flex-row items-start gap-3 mb-3">
                <Ionicons name="mic-outline" size={18} color={colors.onSurfaceVariant} />
                <Text className="text-sm text-on-surface-variant font-cairo flex-1">
                  {t('recordings.tips.itemAndPrice')}
                </Text>
              </View>
              <View className="flex-row items-start gap-3 mb-3">
                <Ionicons name="pricetags-outline" size={18} color={colors.onSurfaceVariant} />
                <Text className="text-sm text-on-surface-variant font-cairo flex-1">
                  {t('recordings.tips.mentionCategory')}
                </Text>
              </View>
              <View className="flex-row items-start gap-3 mb-3">
                <Ionicons name="home-outline" size={18} color={colors.onSurfaceVariant} />
                <Text className="text-sm text-on-surface-variant font-cairo flex-1">
                  {t('recordings.tips.mentionContext')}
                </Text>
              </View>
              <View className="flex-row items-start gap-3 mb-3">
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color={colors.onSurfaceVariant}
                />
                <View className="bg-surface-container-high rounded-xl p-3 flex-1">
                  <Text className="text-sm text-foreground font-cairo-semibold">
                    {t('recordings.tips.example')}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start gap-3">
                <Ionicons name="ear-outline" size={18} color={colors.onSurfaceVariant} />
                <Text className="text-sm text-on-surface-variant font-cairo flex-1">
                  {t('recordings.tips.avoidNoise')}
                </Text>
              </View>
              {/* <TouchableOpacity
                className="mt-4 bg-surface-container-high rounded-xl py-2.5 items-center"
                activeOpacity={0.7}
                onPress={() => {
                  setPendingExpenses([
                    {
                      item: 'خضار وفاكهة',
                      price: 120,
                      currency: 'جنيه',
                      subCategory: 'خضروات',
                      mainCategory: 'أكل ومشروبات',
                      description: 'خضار وفاكهة من السوبر ماركت',
                      confidence: 0.92,
                      merchant: 'كارفور',
                    },
                    {
                      item: 'بنزين 92',
                      price: 300,
                      currency: 'جنيه',
                      subCategory: 'وقود',
                      mainCategory: 'مواصلات',
                      description: 'بنزين 92 للمواصلات',
                      confidence: 0.88,
                      merchant: 'تعاونية البترول',
                    },
                    {
                      item: 'فاتورة كهرباء',
                      price: 450,
                      currency: 'جنيه',
                      subCategory: 'كهرباء',
                      mainCategory: 'فواتير',
                      description: 'فاتورة كهرباء الشهر',
                      confidence: 0.75,
                      merchant: null,
                    },
                  ]);
                  router.push('/review');
                }}
              >
                <Text className="text-sm text-foreground font-cairo-semibold">🧪 Test Review</Text>
              </TouchableOpacity> */}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
