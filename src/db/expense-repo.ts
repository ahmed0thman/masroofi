import { getDb } from './index';

export interface ExpenseRow {
  id: number;
  item: string;
  price: number;
  currency: string;
  sub_category: string;
  main_category: string;
  description: string;
  confidence: number;
  merchant: string | null;
  transcript_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewExpense {
  item: string;
  price: number;
  currency?: string;
  sub_category: string;
  main_category: string;
  description: string;
  confidence?: number;
  merchant?: string | null;
  transcript_id?: string | null;
}

export interface ExpenseFilters {
  search?: string;
  main_category?: string;
  sub_category?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
}

function buildWhereClause(filters: ExpenseFilters): { where: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.search) {
    conditions.push('(item LIKE ? OR description LIKE ? OR merchant LIKE ?)');
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  if (filters.main_category) {
    conditions.push('main_category = ?');
    params.push(filters.main_category);
  }
  if (filters.sub_category) {
    conditions.push('sub_category = ?');
    params.push(filters.sub_category);
  }
  if (filters.dateFrom) {
    conditions.push('created_at >= ?');
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push('created_at <= ?');
    params.push(filters.dateTo + 'T23:59:59.999Z');
  }
  if (filters.priceMin !== undefined) {
    conditions.push('price >= ?');
    params.push(filters.priceMin);
  }
  if (filters.priceMax !== undefined) {
    conditions.push('price <= ?');
    params.push(filters.priceMax);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

export async function getFilteredExpenses(
  filters: ExpenseFilters,
  limit: number,
  offset: number,
): Promise<ExpenseRow[]> {
  const { where, params } = buildWhereClause(filters);
  const db = await getDb();
  return db.getAllAsync<ExpenseRow>(
    `SELECT * FROM expenses ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );
}

export async function getFilteredExpensesCount(filters: ExpenseFilters): Promise<number> {
  const { where, params } = buildWhereClause(filters);
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM expenses ${where}`,
    ...params,
  );
  return row?.count ?? 0;
}

export async function getDistinctMainCategories(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ main_category: string }>(
    'SELECT DISTINCT main_category FROM expenses ORDER BY main_category',
  );
  return rows.map((r) => r.main_category);
}

export async function getDistinctSubCategories(mainCategory?: string): Promise<string[]> {
  const db = await getDb();
  if (mainCategory) {
    const rows = await db.getAllAsync<{ sub_category: string }>(
      'SELECT DISTINCT sub_category FROM expenses WHERE main_category = ? ORDER BY sub_category',
      mainCategory,
    );
    return rows.map((r) => r.sub_category);
  }
  const rows = await db.getAllAsync<{ sub_category: string }>(
    'SELECT DISTINCT sub_category FROM expenses ORDER BY sub_category',
  );
  return rows.map((r) => r.sub_category);
}

export async function insertExpense(expense: NewExpense): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO expenses (item, price, currency, sub_category, main_category, description, confidence, merchant, transcript_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    expense.item,
    expense.price,
    expense.currency ?? 'جنيه',
    expense.sub_category,
    expense.main_category,
    expense.description,
    expense.confidence ?? 0,
    expense.merchant ?? null,
    expense.transcript_id ?? null,
    now,
    now,
  );
  return result.lastInsertRowId as number;
}

export async function insertExpenses(expenses: NewExpense[]): Promise<number[]> {
  const db = await getDb();
  const now = new Date().toISOString();
  const ids: number[] = [];

  const statement = await db.prepareAsync(
    `INSERT INTO expenses (item, price, currency, sub_category, main_category, description, confidence, merchant, transcript_id, created_at, updated_at)
     VALUES ($item, $price, $currency, $sub_category, $main_category, $description, $confidence, $merchant, $transcript_id, $created_at, $updated_at)`,
  );

  try {
    for (const expense of expenses) {
      const result = await statement.executeAsync({
        $item: expense.item,
        $price: expense.price,
        $currency: expense.currency ?? 'جنيه',
        $sub_category: expense.sub_category,
        $main_category: expense.main_category,
        $description: expense.description,
        $confidence: expense.confidence ?? 0,
        $merchant: expense.merchant ?? null,
        $transcript_id: expense.transcript_id ?? null,
        $created_at: now,
        $updated_at: now,
      });
      ids.push(result.lastInsertRowId as number);
    }
  } finally {
    await statement.finalizeAsync();
  }

  return ids;
}

export async function getAllExpenses(): Promise<ExpenseRow[]> {
  const db = await getDb();
  return db.getAllAsync<ExpenseRow>('SELECT * FROM expenses ORDER BY created_at DESC');
}

export async function getExpensesByDateRange(start: string, end: string): Promise<ExpenseRow[]> {
  const db = await getDb();
  return db.getAllAsync<ExpenseRow>(
    'SELECT * FROM expenses WHERE created_at >= ? AND created_at <= ? ORDER BY created_at DESC',
    start,
    end,
  );
}

export async function getExpenseById(id: number): Promise<ExpenseRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ExpenseRow>('SELECT * FROM expenses WHERE id = ?', id);
  return row ?? null;
}

export async function deleteExpense(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
}
