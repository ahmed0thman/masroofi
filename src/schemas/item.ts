import { z } from 'zod';

export const itemRowSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_variants: z.string().nullable(),
  canonical_item_id: z.number().nullable(),
  category_id: z.number().nullable(),
  sub_category_id: z.number().nullable(),
  merchant_id: z.number().nullable(),
  priority: z.string().nullable(),
  is_active: z.number(),
});

export type ItemRow = z.infer<typeof itemRowSchema>;
