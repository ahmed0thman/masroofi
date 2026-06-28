import { z } from 'zod';

export const expenseRecordSchema = z.object({
  item: z.string(),
  price: z.number(),
  currency: z.string(),
  subCategory: z.string(),
  mainCategory: z.string(),
  description: z.string(),
  confidence: z.number(),
  merchant: z.string().nullable(),
  priority: z.string(),
  matchedItemId: z.number().nullable(),
  matchedMerchantId: z.number().nullable(),
  matchedCategoryId: z.number().nullable(),
  matchedSubCategoryId: z.number().nullable(),
});

export type ExpenseRecord = z.infer<typeof expenseRecordSchema>;

export const matchResultSchema = z.object({
  itemId: z.number().nullable(),
  merchantId: z.number().nullable(),
  categoryId: z.number().nullable(),
  subCategoryId: z.number().nullable(),
  confidence: z.number(),
});

export type MatchResult = z.infer<typeof matchResultSchema>;

export const editableExpenseSchema = expenseRecordSchema.extend({
  localId: z.number(),
});

export type EditableExpense = z.infer<typeof editableExpenseSchema>;
