import { z } from 'zod';

export const currencySchema = z.object({
  id: z.number(),
  code: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  symbol: z.string(),
  symbol_en: z.string(),
  is_default: z.number(),
});

export type CurrencyRow = z.infer<typeof currencySchema>;
