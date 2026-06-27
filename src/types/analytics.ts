import type { PeriodType } from '@/hooks/useAnalytics';

export interface AggregatedData {
  totalSpent: number;
  totalTransactions: number;
  dailyAverage: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  topItems: Array<{ name: string; itemId: number | null; amount: number; frequency: number; priority: string }>;
  topMerchants: Array<{ name: string; merchantId: number | null; amount: number; frequency: number }>;
}
