import { z } from 'zod';

export const changeLogActionSchema = z.enum(['CREATE', 'UPDATE', 'MERGE', 'DELETE']);
export type ChangeLogAction = z.infer<typeof changeLogActionSchema>;

export const changeLogRowSchema = z.object({
  id: z.number(),
  table_name: z.string(),
  row_id: z.number(),
  action: changeLogActionSchema,
  old_data: z.string().nullable(),
  new_data: z.string().nullable(),
  source: z.string(),
  created_at: z.string(),
});

export type ChangeLogRow = z.infer<typeof changeLogRowSchema>;
