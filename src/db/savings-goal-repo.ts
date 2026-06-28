import { getDb } from './index';
import type { SavingsGoal, CreateGoalInput } from '@/schemas';
export type { SavingsGoal, CreateGoalInput };

export async function createGoal(goal: CreateGoalInput): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO savings_goals (name, target_amount, current_amount, deadline, icon, color, created_at, updated_at)
     VALUES (?, ?, 0, ?, ?, ?, ?, ?)`,
    goal.name,
    goal.targetAmount,
    goal.deadline ?? null,
    goal.icon ?? 'flag',
    goal.color ?? null,
    now,
    now,
  );
  return result.lastInsertRowId as number;
}

export async function getGoals(): Promise<SavingsGoal[]> {
  const db = await getDb();
  return db.getAllAsync<SavingsGoal>(
    'SELECT * FROM savings_goals WHERE is_active = 1 ORDER BY created_at DESC',
  );
}

export async function updateGoal(id: number, updates: Partial<SavingsGoal>): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const allowed = ['name', 'target_amount', 'current_amount', 'deadline', 'icon', 'color', 'is_active'] as const;
  const setClauses: string[] = [];
  const values: (string | number | null)[] = [];

  for (const key of allowed) {
    if (key in updates) {
      setClauses.push(`${key} = ?`);
      values.push(updates[key] as string | number | null);
    }
  }

  if (setClauses.length === 0) return;

  setClauses.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE savings_goals SET ${setClauses.join(', ')} WHERE id = ?`,
    values,
  );
}

export async function deleteGoal(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM savings_goals WHERE id = ?', id);
}

export async function updateGoalProgress(id: number, amount: number): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE savings_goals SET current_amount = current_amount + ?, updated_at = ? WHERE id = ?',
    amount,
    now,
    id,
  );
}
