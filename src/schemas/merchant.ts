import { z } from 'zod';

export const merchantRowSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_variants: z.string().nullable(),
  name_en: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  is_active: z.number(),
});

export type MerchantRow = z.infer<typeof merchantRowSchema>;
