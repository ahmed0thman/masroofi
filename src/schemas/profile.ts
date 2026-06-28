import { z } from 'zod';

export const userTypeSchema = z.enum(['user', 'admin', 'tester']);
export type UserType = z.infer<typeof userTypeSchema>;

export const profileSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar_uri: z.string().nullable(),
  language: z.string(),
  theme: z.string(),
  reminders_enabled: z.number(),
  user_type: userTypeSchema,
  gender: z.string(),
  location: z.string(),
  age: z.number(),
  monthly_budget: z.number(),
  saving_goal: z.number(),
  analytics_day: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;

export const createProfileInputSchema = z.object({
  name: z.string(),
  language: z.string().optional(),
  theme: z.string().optional(),
  reminders_enabled: z.number().optional(),
  gender: z.string().optional(),
  location: z.string().optional(),
  age: z.number().optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileInputSchema>;
