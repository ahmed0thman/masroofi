import { z } from 'zod';

export const expenseRowSchema = z.object({
  id: z.number(),
  item_name: z.string(),
  price: z.number(),
  currency_id: z.number(),
  description: z.string(),
  merchant_id: z.number().nullable(),
  merchant_name: z.string().nullable().optional(),
  item_id: z.number().nullable(),
  item_name_variants: z.string().nullable().optional(),
  category_id: z.number().nullable(),
  category_name: z.string().nullable().optional(),
  category_default_priority: z.string().nullable().optional(),
  sub_category_id: z.number().nullable(),
  sub_category_name: z.string().nullable().optional(),
  confidence: z.number(),
  transcript_id: z.string().nullable(),
  source: z.string(),
  created_at: z.string(),
  priority: z.string().optional(),
  updated_at: z.string(),
});

export type ExpenseRow = z.infer<typeof expenseRowSchema>;

export const newExpenseSchema = z.object({
  item_name: z.string(),
  price: z.number(),
  description: z.string().optional(),
  merchant_id: z.number().nullable().optional(),
  item_id: z.number().nullable().optional(),
  category_id: z.number().nullable().optional(),
  sub_category_id: z.number().nullable().optional(),
  confidence: z.number().optional(),
  transcript_id: z.string().nullable().optional(),
  source: z.string().optional(),
  priority: z.string().optional(),
});

export type NewExpense = z.infer<typeof newExpenseSchema>;

export const expenseFiltersSchema = z.object({
  search: z.string().optional(),
  category_id: z.number().optional(),
  sub_category_id: z.number().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
});

export type ExpenseFilters = z.infer<typeof expenseFiltersSchema>;
