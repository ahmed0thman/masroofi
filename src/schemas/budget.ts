import { z } from 'zod';

export const budgetOverviewSchema = z.object({
  categoryId: z.number().nullable(),
  amount: z.number(),
});

export type BudgetOverview = z.infer<typeof budgetOverviewSchema>;

export const budgetProgressItemSchema = z.object({
  categoryId: z.number().nullable(),
  categoryName: z.string(),
  budget: z.number(),
  spent: z.number(),
  percentage: z.number(),
});

export type BudgetProgressItem = z.infer<typeof budgetProgressItemSchema>;
