import { z } from 'zod';

export const wordEquivalenceRowSchema = z.object({
  id: z.number(),
  canonical: z.string(),
  variant: z.string(),
  dialect: z.string().nullable(),
  source: z.string(),
});

export type WordEquivalenceRow = z.infer<typeof wordEquivalenceRowSchema>;
