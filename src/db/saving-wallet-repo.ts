import { getDb } from './index';
import type { SavingWalletEntry } from '@/schemas';
export type { SavingWalletEntry };

export async function recalculateMonthlySavings(budget: number): Promise<void> {
  const db = await getDb();
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const totalRow = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(price), 0) AS total FROM expenses WHERE strftime('%Y-%m', created_at) = ?",
    month,
  );
  const totalSpent = totalRow?.total ?? 0;
  const savings = Math.max(0, budget - totalSpent);

  const existing = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM saving_wallet_entries WHERE type = 'monthly' AND month = ?",
    month,
  );
  const nowISO = new Date().toISOString();
  if (existing) {
    await db.runAsync(
      "UPDATE saving_wallet_entries SET amount = ?, updated_at = ? WHERE id = ?",
      savings, nowISO, existing.id,
    );
  } else {
    await db.runAsync(
      "INSERT INTO saving_wallet_entries (type, amount, month, note, created_at, updated_at) VALUES ('monthly', ?, ?, '', ?, ?)",
      savings, month, nowISO, nowISO,
    );
  }
}

export async function getWalletBalance(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ balance: number }>(
    'SELECT COALESCE(SUM(amount), 0) AS balance FROM saving_wallet_entries',
  );
  return row?.balance ?? 0;
}

export async function addExtraSaving(amount: number, note: string): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    "INSERT INTO saving_wallet_entries (type, amount, note, created_at, updated_at) VALUES ('extra', ?, ?, ?, ?)",
    amount, note, now, now,
  );
  return result.lastInsertRowId as number;
}

export async function updateExtraSaving(id: number, amount: number, note: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    "UPDATE saving_wallet_entries SET amount = ?, note = ?, updated_at = ? WHERE id = ? AND type = 'extra'",
    amount, note, now, id,
  );
}

export async function deleteEntry(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM saving_wallet_entries WHERE id = ?', id);
}

export async function getExtraSavings(): Promise<SavingWalletEntry[]> {
  const db = await getDb();
  return db.getAllAsync<SavingWalletEntry>(
    "SELECT * FROM saving_wallet_entries WHERE type = 'extra' ORDER BY created_at DESC",
  );
}

export async function getMonthlySavings(): Promise<SavingWalletEntry[]> {
  const db = await getDb();
  return db.getAllAsync<SavingWalletEntry>(
    "SELECT * FROM saving_wallet_entries WHERE type = 'monthly' ORDER BY month DESC",
  );
}
