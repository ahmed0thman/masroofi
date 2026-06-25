import { getDb } from './index';

export interface Reminder {
  id: number;
  time: string;
  meridiem: string;
  enabled: number;
  created_at: string;
}

export interface NewReminder {
  time: string;
  meridiem: string;
  enabled?: number;
}

export async function getAllReminders(): Promise<Reminder[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Reminder>(
    'SELECT * FROM reminders ORDER BY created_at ASC',
  );
  return rows ?? [];
}

export async function insertReminder(reminder: NewReminder): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  const enabled = reminder.enabled ?? 1;

  const result = await db.runAsync(
    'INSERT INTO reminders (time, meridiem, enabled, created_at) VALUES (?, ?, ?, ?)',
    reminder.time,
    reminder.meridiem,
    enabled,
    now,
  );
  return result.lastInsertRowId as number;
}

export async function updateReminder(id: number, updates: Partial<Reminder>): Promise<void> {
  const db = await getDb();
  const setClauses: string[] = [];
  const values: (string | number)[] = [];

  const allowed = ['time', 'meridiem', 'enabled'] as const;
  for (const key of allowed) {
    if (key in updates) {
      setClauses.push(`${key} = ?`);
      values.push(updates[key] as string | number);
    }
  }

  if (setClauses.length === 0) return;

  values.push(id);
  await db.runAsync(
    `UPDATE reminders SET ${setClauses.join(', ')} WHERE id = ?`,
    values,
  );
}

export async function deleteReminder(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM reminders WHERE id = ?', id);
}

export async function getEnabledReminders(): Promise<Reminder[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Reminder>(
    'SELECT * FROM reminders WHERE enabled = 1 ORDER BY created_at ASC',
  );
  return rows ?? [];
}
