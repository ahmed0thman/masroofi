import { z } from 'zod';

export const categoryRowSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_en: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  default_priority: z.enum(['essential', 'important', 'normal', 'luxury']),
  sort_order: z.number(),
  is_active: z.number(),
});

export type CategoryRow = z.infer<typeof categoryRowSchema>;

export const subCategoryRowSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_en: z.string().nullable(),
  category_id: z.number(),
  is_active: z.number(),
});

export type SubCategoryRow = z.infer<typeof subCategoryRowSchema>;
