import { z } from 'zod';

export const savingsGoalSchema = z.object({
  id: z.number(),
  name: z.string(),
  target_amount: z.number(),
  current_amount: z.number(),
  deadline: z.string().nullable(),
  icon: z.string(),
  color: z.string().nullable(),
  is_active: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SavingsGoal = z.infer<typeof savingsGoalSchema>;

export const createGoalInputSchema = z.object({
  name: z.string(),
  targetAmount: z.number(),
  deadline: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalInputSchema>;
