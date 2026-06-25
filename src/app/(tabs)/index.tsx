import { View, Text, ScrollView } from 'react-native';
import React, { useCallback } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import SafeAreaView from '@/components/layout/SafeAreaView';
import Header from '@/components/Header';
import { useExpenses } from '@/hooks/useExpenses';
import { useProfile } from '@/hooks/useProfile';
import ExpenseCard from '@/components/cards/ExpenseCard';
import { ErrorState } from '@/components/ErrorState';
import { formatAmount } from '@/lib/format';

export default function Home() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { expenses, isLoading, error, refresh } = useExpenses();
  const { profile, refresh: refreshProfile } = useProfile();

  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshProfile();
    }, [refresh, refreshProfile]),
  );

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

  const monthCurrency = thisMonthExpenses.length > 0 ? thisMonthExpenses[0].currency : 'جنيه';
  const todayCurrency = todayExpenses.length > 0 ? todayExpenses[0].currency : 'جنيه';

  const monthFormatted = formatAmount(monthTotal, monthCurrency);
  const todayFormatted = formatAmount(todayTotal, todayCurrency);

  return (
    <SafeAreaView className="bg-background flex-1 w-full">
      <View className="flex-1 gap-3">
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
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="gap-8 pb-8 w-full">
            {todayExpenses.length > 0 && (
              <View className="gap-3">
                {todayExpenses.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
