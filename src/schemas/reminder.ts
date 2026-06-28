import { z } from 'zod';

export const reminderSchema = z.object({
  id: z.number(),
  time: z.string(),
  meridiem: z.string(),
  enabled: z.number(),
  created_at: z.string(),
});

export type Reminder = z.infer<typeof reminderSchema>;

export const newReminderSchema = z.object({
  time: z.string(),
  meridiem: z.string(),
  enabled: z.number().optional(),
});

export type NewReminder = z.infer<typeof newReminderSchema>;
