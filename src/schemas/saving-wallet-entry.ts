import { z } from 'zod';

export const savingWalletEntrySchema = z.object({
  id: z.number(),
  type: z.enum(['monthly', 'extra']),
  amount: z.number(),
  month: z.string().nullable(),
  note: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SavingWalletEntry = z.infer<typeof savingWalletEntrySchema>;
