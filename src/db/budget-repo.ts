import { getDb } from './index';

export async function setMonthlyBudget(month: string, amount: number, categoryId?: number): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO budgets (month, amount, category_id, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(month, category_id) DO UPDATE SET amount = ?, updated_at = ?`,
    month, amount, categoryId ?? null, now, amount, now,
  );
}

export async function getMonthlyBudget(month: string, categoryId?: number): Promise<number | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ amount: number }>(
    'SELECT amount FROM budgets WHERE month = ? AND category_id IS ?',
    month, categoryId ?? null,
  );
  return row?.amount ?? null;
}

export async function getAllBudgetsForMonth(month: string): Promise<Array<{ categoryId: number | null; amount: number }>> {
  const db = await getDb();
  return db.getAllAsync<{ categoryId: number | null; amount: number }>(
    `SELECT category_id AS categoryId, amount FROM budgets WHERE month = ? ORDER BY amount DESC`,
    month,
  );
}

export async function getBudgetProgress(month: string): Promise<Array<{ categoryId: number | null; categoryName: string; budget: number; spent: number; percentage: number }>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ categoryId: number | null; categoryName: string | null; budget: number; spent: number }>(
    `SELECT b.category_id AS categoryId, COALESCE(c.name, 'غير مصنف') AS categoryName,
            b.amount AS budget, COALESCE(SUM(e.price), 0) AS spent
     FROM budgets b
     LEFT JOIN expenses e ON e.category_id = b.category_id
       AND e.created_at >= ? AND e.created_at < ?
     LEFT JOIN categories c ON c.id = b.category_id
     WHERE b.month = ?
     GROUP BY b.category_id, b.amount`,
    `${month}-01T00:00:00.000Z`,
    getNextMonth(month),
    month,
  );
  return rows.map(r => ({
    categoryId: r.categoryId,
    categoryName: r.categoryName ?? 'غير مصنف',
    budget: r.budget,
    spent: r.spent,
    percentage: r.budget > 0 ? Math.min(100, Math.round((r.spent / r.budget) * 100)) : 0,
  }));
}

export async function removeBudget(month: string, categoryId?: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM budgets WHERE month = ? AND category_id IS ?',
    month, categoryId ?? null,
  );
}

function getNextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(y, m);
  return date.toISOString();
}
