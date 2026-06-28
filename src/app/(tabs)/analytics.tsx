import {
  AiInsights,
  BudgetSection,
  CategoryBreakdown,
  HeroCard,
  KpiCard,
  KpiRow,
  PeriodSelector,
  PriorityBreakdown,
  SkeletonSection,
  SpendingTrend,
} from '@/components/analytics';
import SafeAreaView from '@/components/layout/SafeAreaView';
import { useAnalytics, type PeriodType } from '@/hooks/useAnalytics';
import { getLatestAnalyticsSummary } from '@/services/analytics';
import { formatShortCurrency } from '@/services/format';
import { getCurrencyById, type CurrencyRow } from '@/db/currency-repo';
import { getProfile } from '@/db/profile-repo';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AnalyticsScreen() {
  const { t, i18n } = useTranslation();
  const [profileCurrency, setProfileCurrency] = useState<CurrencyRow | null>(null);

  useEffect(() => {
    (async () => {
      const profile = await getProfile();
      const currencyId = profile?.currency_id ?? 1;
      const currency = await getCurrencyById(currencyId);
      setProfileCurrency(currency);
    })();
  }, []);

  const currencySymbol = profileCurrency
    ? i18n.language === 'ar'
      ? profileCurrency.symbol
      : profileCurrency.symbol_en || profileCurrency.symbol
    : '';

  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [customFrom, setCustomFrom] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [customTo, setCustomTo] = useState<Date>(new Date());
  const [showComparison, setShowComparison] = useState(true);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const { data, isLoading, error, changePercentage, dailySpendingSum, budgetData } = useAnalytics(
    periodType,
    customFrom.toISOString(),
    customTo.toISOString(),
  );

  const loadAiSummary = useCallback(async () => {
    const summary = await getLatestAnalyticsSummary();
    setAiSummary(summary);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAiSummary();
    }, [loadAiSummary]),
  );

  const handlePeriodChange = useCallback((p: PeriodType) => {
    setPeriodType(p);
  }, []);

  const handleCustomDateChange = useCallback((from: Date, to: Date) => {
    setCustomFrom(from);
    setCustomTo(to);
  }, []);
  const handleRedirectToRecordExpense = () => {
    router.push('/(tabs)/record');
  };

  const totalSpent = data?.totalSpent ?? 0;

  console.log(data?.byPriority);

  if (isLoading) {
    return (
      <SafeAreaView className="px-0">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View className="flex-col gap-4 px-4">
            <SkeletonSection type="hero" />
            <SkeletonSection type="kpi" />
            <SkeletonSection type="budget" />
            <SkeletonSection type="chart" />
            <SkeletonSection type="insights" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-4">
        <View className="bg-error/10 p-4 rounded-xl flex-row items-center justify-between w-full">
          <Text className="font-cairo text-error flex-1">{t('analytics.errorSection')}</Text>
          <TouchableOpacity onPress={() => {}} className="bg-error px-3 py-1 rounded-lg">
            <Text className="text-white font-cairo-bold text-xs">
              {t('analytics.retrySection')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (totalSpent === 0) {
    return (
      <SafeAreaView className="flex-1 px-0">
        <PeriodSelector
          periodType={periodType}
          onPeriodChange={handlePeriodChange}
          customFrom={customFrom}
          customTo={customTo}
          onCustomDateChange={handleCustomDateChange}
          showComparisonToggleButton={false}
          showComparison={showComparison}
          onComparisonToggle={setShowComparison}
        />
        <View className="flex-1 items-center justify-center gap-6 px-4">
          <Text className="font-cairo text-muted-foreground text-center mb-6">
            {t('analytics.noDataRecord')}
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-full"
            onPress={handleRedirectToRecordExpense}
          >
            <Text className="font-cairo-bold text-on-primary">{t('analytics.recordExpense')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="px-0">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 10 }}
      >
        <PeriodSelector
          periodType={periodType}
          onPeriodChange={handlePeriodChange}
          customFrom={customFrom}
          customTo={customTo}
          onCustomDateChange={handleCustomDateChange}
          showComparisonToggleButton={true}
          showComparison={showComparison}
          onComparisonToggle={setShowComparison}
        />

        <HeroCard
          totalSpent={totalSpent}
          changePercentage={changePercentage}
          showComparison={showComparison}
          currency={profileCurrency}
        />

        <BudgetSection
          percentage={budgetData.percentage}
          monthlyBudget={budgetData.monthlyBudget}
          spent={totalSpent}
          currency={profileCurrency}
        />

        <KpiRow>
          <KpiCard label={t('analytics.totalTransactions')} value={data?.totalTransactions ?? 0} />
          <KpiCard
            label={t('analytics.dailyAverage')}
            value={`${formatShortCurrency(data?.dailyAverage ?? 0, i18n.language)} ${currencySymbol}`}
          />
        </KpiRow>

        <SpendingTrend data={dailySpendingSum} />

        <CategoryBreakdown data={data?.byCategory ?? {}} />

        <PriorityBreakdown data={data?.byPriority ?? {}} />

        <AiInsights insights={aiSummary?.insights || []} isLoading={isGeneratingAi} />
      </ScrollView>
    </SafeAreaView>
  );
}
