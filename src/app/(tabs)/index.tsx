import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRouter } from 'expo-router';
import SafeAreaView from '@/components/layout/SafeAreaView';
import Header from '@/components/Header';
import { useExpenses } from '@/hooks/useExpenses';
import { useProfile } from '@/hooks/useProfile';
import ExpenseCard from '@/components/cards/ExpenseCard';
import { ErrorState } from '@/components/ErrorState';
import { formatAmount } from '@/lib/format';
import { EditExpenseSheet } from '@/components/cards/EditExpenseSheet';
import { getLatestAnalyticsSummary } from '@/services/analytics';
import { getDefaultCurrency, type CurrencyRow } from '@/db/currency-repo';
import type { ExpenseRow } from '@/db/expense-repo';

export default function Home() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { expenses, isLoading, error, refresh, deleteExpense, updateExpense } = useExpenses();
  const [editingExpense, setEditingExpense] = useState<ExpenseRow | null>(null);
  const [analyticsSummary, setAnalyticsSummary] = useState<{
    totalSpent: number;
    changeFromPrevious: string;
    topInsight: string;
    topRecommendation: string;
  } | null>(null);
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyRow | null>(null);
  const { profile, refresh: refreshProfile } = useProfile();

  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshProfile();
      getDefaultCurrency().then(setDefaultCurrency);
      getLatestAnalyticsSummary().then(setAnalyticsSummary).catch(() => {});
    }, [refresh, refreshProfile]),
  );

  const defaultSymbol = useMemo(() => {
    if (!defaultCurrency) return '';
    return i18n.language === 'ar' ? defaultCurrency.symbol : (defaultCurrency.symbol_en || defaultCurrency.symbol);
  }, [defaultCurrency, i18n.language]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  const todayExpenses = expenses.filter((e) => {
    const d = new Date(e.created_at);
    return (
      d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === currentDay
    );
  });

  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.created_at);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthYear = lastMonthDate.getFullYear();
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.created_at);
    return d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth;
  });

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayExpenses = expenses.filter((e) => {
    const d = new Date(e.created_at);
    return (
      d.getFullYear() === yesterdayDate.getFullYear() &&
      d.getMonth() === yesterdayDate.getMonth() &&
      d.getDate() === yesterdayDate.getDate()
    );
  });

  const monthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.price, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.price, 0);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.price, 0);
  const yesterdayTotal = yesterdayExpenses.reduce((sum, e) => sum + e.price, 0);

  const monthChange =
    lastMonthTotal > 0 ? ((monthTotal - lastMonthTotal) / lastMonthTotal) * 100 : null;
  const dayChange =
    yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : null;

  const monthSymbol = defaultSymbol || (thisMonthExpenses.length > 0 ? (thisMonthExpenses[0].currency_symbol_en || thisMonthExpenses[0].currency_symbol || thisMonthExpenses[0].currency_code || '') : '');
  const todaySymbol = defaultSymbol || (todayExpenses.length > 0 ? (todayExpenses[0].currency_symbol_en || todayExpenses[0].currency_symbol || todayExpenses[0].currency_code || '') : '');

  const monthFormatted = formatAmount(monthTotal, monthSymbol, i18n.language);
  const todayFormatted = formatAmount(todayTotal, todaySymbol, i18n.language);

  return (
    <SafeAreaView className="bg-background flex-1 w-full">
      <View className="flex-1 gap-3 ">
        <Header name={profile?.name} avatarUri={profile?.avatar_uri} />
        {error ? (
          <View className="pt-4">
            <ErrorState message={error} onRetry={refresh} />
          </View>
        ) : (
          <View className="flex-row gap-3 py-4">
            <View className="flex-1 bg-card rounded-2xl p-4 items-start">
              <View className="flex-row items-center gap-2">
                <Ionicons name="wallet-outline" size={16} color={colors.secondaryContainer} />
                <Text className="text-muted-foreground font-cairo text-sm">
                  {t('home.monthTotal')}
                </Text>
              </View>
              <Text className="text-4xl leading-6 font-cairo-bold text-on-surface mt-1">
                {monthFormatted.amount}
                <Text className="text-sm font-cairo-medium text-on-surface">
                  {' '}
                  {monthFormatted.suffix}
                </Text>
              </Text>
              <View className="flex-row items-center mt-1">
                {monthChange !== null ? (
                  <>
                    <Ionicons
                      name={monthChange >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={14}
                      color={monthChange >= 0 ? colors.success : colors.error}
                    />
                    <Text
                      className="text-xs font-cairo-semibold ml-1"
                      style={{ color: monthChange >= 0 ? colors.success : colors.error }}
                    >
                      {monthChange >= 0 ? '+' : ''}
                      {monthChange.toFixed(0)}% {t('home.vsLastMonth')}
                    </Text>
                  </>
                ) : (
                  <Text className="text-xs font-cairo text-muted-foreground">—</Text>
                )}
              </View>
            </View>

            <View className="flex-1 bg-card rounded-2xl p-4 items-start">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="calendar-clear-outline"
                  size={16}
                  color={colors.secondaryContainer}
                />
                <Text className="text-muted-foreground font-cairo text-sm">
                  {t('home.todayTotal')}
                </Text>
              </View>
              <Text className="text-4xl leading-6 font-cairo-bold text-on-surface mt-1">
                {todayFormatted.amount}
                <Text className="text-sm font-cairo-medium text-on-surface">
                  {' '}
                  {todayFormatted.suffix}
                </Text>
              </Text>
              <View className="flex-row items-center mt-1">
                {dayChange !== null ? (
                  <>
                    <Ionicons
                      name={dayChange >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={14}
                      color={dayChange >= 0 ? colors.success : colors.error}
                    />
                    <Text
                      className="text-xs font-cairo-semibold ml-1"
                      style={{ color: dayChange >= 0 ? colors.success : colors.error }}
                    >
                      {dayChange >= 0 ? '+' : ''}
                      {dayChange.toFixed(0)}% {t('home.vsYesterday')}
                    </Text>
                  </>
                ) : (
                  <Text className="text-xs font-cairo text-muted-foreground">—</Text>
                )}
              </View>
            </View>
          </View>
        )}
        {analyticsSummary && (
          <TouchableOpacity
            className="bg-surface-container-low rounded-2xl p-4 flex-row items-center gap-3"
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/analytics')}
          >
            <View className="bg-primary-container/20 rounded-xl p-2">
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-cairo-semibold text-on-surface" numberOfLines={1}>
                {analyticsSummary.topInsight}
              </Text>
              <Text className="text-xs font-cairo text-muted-foreground mt-0.5" numberOfLines={1}>
                {analyticsSummary.topRecommendation}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
        <View>
          <Text className="text-lg font-cairo-bold text-foreground">
            {t('home.recentExpenses')}
          </Text>
        </View>
        <FlatList
          data={todayExpenses}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ExpenseCard expense={item} onEdit={(id) => { const exp = expenses.find(e => e.id === id); if (exp) setEditingExpense(exp); }} onDelete={deleteExpense} />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-muted-foreground font-cairo">
                {t('home.history.emptyTitle')}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-8"
          className="flex-1"
          ItemSeparatorComponent={() => <View className="h-2" />}
        />
      </View>
      <EditExpenseSheet
        visible={!!editingExpense}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSave={async (id, data) => {
          await updateExpense?.(id, data);
          setEditingExpense(null);
        }}
      />
    </SafeAreaView>
  );
}
