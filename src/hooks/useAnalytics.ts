import { useState, useEffect, useCallback } from 'react';
import { aggregateExpensesForPeriod } from '@/db/expense-repo';
import { getDailySpendingSum } from '@/db/analytics-repo';
import { getProfile } from '@/db/profile-repo';
import { getDayPeriod, getMonthPeriod, getWeekPeriods, getPreviousPeriod } from '@/services/analytics';

export type PeriodType = 'day' | 'week' | 'month' | 'custom';

export interface AggregatedData {
  totalSpent: number;
  totalTransactions: number;
  dailyAverage: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  topItems: Array<{ name: string; itemId: number | null; amount: number; frequency: number; priority: string }>;
  topMerchants: Array<{ name: string; merchantId: number | null; amount: number; frequency: number }>;
}

export interface UseAnalyticsResult {
  data: AggregatedData | null;
  previousData: AggregatedData | null;
  isLoading: boolean;
  error: string | null;
  periodStart: string;
  periodEnd: string;
  changePercentage: number;
  dailySpendingSum: { date: string; amount: number }[];
  budgetData: {
    monthlyBudget: number;
    percentage: number;
  };
}

export function useAnalytics(periodType: PeriodType, from?: string, to?: string): UseAnalyticsResult {
  const [data, setData] = useState<AggregatedData | null>(null);
  const [previousData, setPreviousData] = useState<AggregatedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [changePercentage, setChangePercentage] = useState(0);
  const [dailySpendingSum, setDailySpendingSum] = useState<{ date: string; amount: number }[]>([]);
  const [budgetData, setBudgetData] = useState({ monthlyBudget: 0, percentage: 0 });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let start: string;
      let end: string;

      if (periodType === 'custom' && from && to) {
        start = from;
        end = to;
      } else {
        const now = new Date();
        if (periodType === 'day') {
          const p = getDayPeriod(now);
          start = p.start;
          end = p.end;
        } else if (periodType === 'week') {
          const periods = getWeekPeriods(now, 1);
          start = periods[0].start;
          end = periods[0].end;
        } else {
          const p = getMonthPeriod(now);
          start = p.start;
          end = p.end;
        }
      }

      setPeriodStart(start);
      setPeriodEnd(end);

      const [aggregated, dailySums, profile] = await Promise.all([
        aggregateExpensesForPeriod(start, end),
        getDailySpendingSum(start, end),
        getProfile(),
      ]);

      setData({
        ...aggregated,
        dailyAverage: dailySums.length > 0 ? Math.round(aggregated.totalSpent / dailySums.length) : 0,
      });

      setDailySpendingSum(dailySums);

      const monthlyBudget = profile?.monthly_budget ?? 0;
      const budgetPercentage = monthlyBudget > 0 
        ? Math.min(100, Math.round((aggregated.totalSpent / monthlyBudget) * 100)) 
        : 0;
      
      setBudgetData({ monthlyBudget, percentage: budgetPercentage });

      const prev = getPreviousPeriod(start, end);
      const prevResult = await aggregateExpensesForPeriod(prev.start, prev.end);
      setPreviousData({
        ...prevResult,
        dailyAverage: prevResult.totalTransactions > 0
          ? Math.round(prevResult.totalSpent / Math.max(1, Math.round((new Date(prev.end).getTime() - new Date(prev.start).getTime()) / (1000 * 60 * 60 * 24))))
          : 0,
      });

      if (prevResult.totalSpent > 0) {
        setChangePercentage(Math.round(((aggregated.totalSpent - prevResult.totalSpent) / prevResult.totalSpent) * 100));
      } else {
        setChangePercentage(aggregated.totalSpent > 0 ? 100 : 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [periodType, from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, previousData, isLoading, error, periodStart, periodEnd, changePercentage, dailySpendingSum, budgetData };
}
