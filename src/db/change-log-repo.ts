import { getDb } from './index';
import type { ChangeLogRow } from '@/schemas';
export type { ChangeLogRow };

export async function insertChangeLog(data: {
  table_name: string;
  row_id: number;
  action: string;
  old_data?: string;
  new_data?: string;
  source?: string;
}): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO change_log (table_name, row_id, action, old_data, new_data, source)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.table_name,
    data.row_id,
    data.action,
    data.old_data ?? null,
    data.new_data ?? null,
    data.source ?? 'system',
  );
}

export async function getRecentChanges(limit: number = 50): Promise<ChangeLogRow[]> {
  const db = await getDb();
  return db.getAllAsync<ChangeLogRow>(
    'SELECT * FROM change_log ORDER BY created_at DESC LIMIT ?',
    limit,
  );
}
