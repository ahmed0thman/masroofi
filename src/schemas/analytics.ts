import { z } from 'zod';

export const analyticsRowSchema = z.object({
  id: z.number(),
  period_start: z.string(),
  period_end: z.string(),
  period_type: z.string(),
  generated_at: z.string(),
  data: z.string(),
  insights: z.string().nullable(),
  recommendations: z.string().nullable(),
  status: z.string(),
  token_estimate: z.number().nullable(),
  model_used: z.string().nullable(),
});

export type AnalyticsRow = z.infer<typeof analyticsRowSchema>;

export const aggregatedDataSchema = z.object({
  totalSpent: z.number(),
  totalTransactions: z.number(),
  dailyAverage: z.number(),
  byCategory: z.record(z.string(), z.number()),
  byPriority: z.record(z.string(), z.number()),
  topItems: z.array(
    z.object({
      name: z.string(),
      itemId: z.number().nullable(),
      amount: z.number(),
      frequency: z.number(),
      priority: z.string(),
    }),
  ),
  topMerchants: z.array(
    z.object({
      name: z.string(),
      merchantId: z.number().nullable(),
      amount: z.number(),
      frequency: z.number(),
    }),
  ),
});

export type AggregatedData = z.infer<typeof aggregatedDataSchema>;

export const geminiAnalyticsResponseSchema = z.object({
  summary: z.object({
    totalSpent: z.number(),
    totalTransactions: z.number(),
    dailyAverage: z.number(),
    changeFromPrevious: z.string(),
    changeDirection: z.enum(['up', 'down', 'stable']),
  }),
  byCategory: z.record(
    z.string(),
    z.object({
      amount: z.number(),
      percentage: z.number(),
      trend: z.enum(['up', 'down', 'stable']),
      vsAverage: z.string(),
    }),
  ),
  byPriority: z.record(
    z.string(),
    z.object({
      amount: z.number(),
      percentage: z.number(),
      trend: z.enum(['up', 'down', 'stable']),
    }),
  ),
  topItems: z.array(
    z.object({
      name: z.string(),
      itemId: z.number(),
      amount: z.number(),
      frequency: z.number(),
      priority: z.string(),
    }),
  ),
  topMerchants: z.array(
    z.object({
      name: z.string(),
      merchantId: z.number(),
      amount: z.number(),
      frequency: z.number(),
    }),
  ),
  insights: z.array(
    z.object({
      text: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
      category: z.string(),
    }),
  ),
  recommendations: z.array(
    z.object({
      text: z.string(),
      potentialSavings: z.number(),
      priority: z.enum(['low', 'medium', 'high']),
    }),
  ),
  anomalies: z.array(
    z.object({
      item: z.string(),
      amount: z.number(),
      expectedAvg: z.number(),
      reason: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
    }),
  ),
  topNewItems: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      firstSeen: z.string(),
    }),
  ),
  metadata: z.object({
    totalItems: z.number(),
    totalCategories: z.number(),
    totalMerchants: z.number(),
    currency: z.string(),
  }),
});

export type GeminiAnalyticsResponse = z.infer<typeof geminiAnalyticsResponseSchema>;
