import { getDb } from './index';
import type { ExpenseRow, NewExpense, ExpenseFilters } from '@/schemas';
export type { ExpenseRow, NewExpense, ExpenseFilters };
import { recalculateMonthlySavings } from './saving-wallet-repo';

const expenseSelectColumns = `
  e.id, e.item_name, e.price, e.currency_id,
  e.description, e.merchant_id, m.name AS merchant_name,
  e.item_id, i.name_variants AS item_name_variants,
  e.category_id, cat.name AS category_name, cat.default_priority AS category_default_priority,
  e.sub_category_id, sc.name AS sub_category_name,
  e.confidence, e.transcript_id, e.source, e.priority, e.created_at, e.updated_at
`;

const expenseJoinClause = `
  FROM expenses e
  LEFT JOIN merchants m ON m.id = e.merchant_id
  LEFT JOIN items i ON i.id = e.item_id
  LEFT JOIN categories cat ON cat.id = e.category_id
  LEFT JOIN sub_categories sc ON sc.id = e.sub_category_id
`;

export function buildWhereClause(filters: ExpenseFilters): { where: string; params: (string | number)[] } {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.search) {
    conditions.push('(e.item_name LIKE ? OR e.description LIKE ? OR m.name LIKE ?)');
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  if (filters.category_id) {
    conditions.push('e.category_id = ?');
    params.push(filters.category_id);
  }
  if (filters.sub_category_id) {
    conditions.push('e.sub_category_id = ?');
    params.push(filters.sub_category_id);
  }
  if (filters.dateFrom) {
    conditions.push('e.created_at >= ?');
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push('e.created_at <= ?');
    params.push(filters.dateTo + 'T23:59:59.999Z');
  }
  if (filters.priceMin !== undefined) {
    conditions.push('e.price >= ?');
    params.push(filters.priceMin);
  }
  if (filters.priceMax !== undefined) {
    conditions.push('e.price <= ?');
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
    `SELECT ${expenseSelectColumns} ${expenseJoinClause} ${where} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );
}

export async function getFilteredExpensesCount(filters: ExpenseFilters): Promise<number> {
  const { where, params } = buildWhereClause(filters);
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count ${expenseJoinClause} ${where}`,
    ...params,
  );
  return row?.count ?? 0;
}

export async function getAllExpenses(): Promise<ExpenseRow[]> {
  const db = await getDb();
  return db.getAllAsync<ExpenseRow>(
    `SELECT ${expenseSelectColumns} ${expenseJoinClause} ORDER BY e.created_at DESC`,
  );
}

export async function getExpensesByDateRange(start: string, end: string): Promise<ExpenseRow[]> {
  const db = await getDb();
  return db.getAllAsync<ExpenseRow>(
    `SELECT ${expenseSelectColumns} ${expenseJoinClause} WHERE e.created_at >= ? AND e.created_at <= ? ORDER BY e.created_at DESC`,
    start,
    end,
  );
}

export async function getExpenseById(id: number): Promise<ExpenseRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ExpenseRow>(
    `SELECT ${expenseSelectColumns} ${expenseJoinClause} WHERE e.id = ?`,
    id,
  );
  return row ?? null;
}

export async function insertExpense(expense: NewExpense): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  // Resolve currency_id from profile (global setting)
  const profile = await db.getFirstAsync<{ currency_id: number; monthly_budget: number }>('SELECT currency_id, monthly_budget FROM profiles LIMIT 1');
  const currencyId = profile?.currency_id ?? 1;
  const result = await db.runAsync(
    `INSERT INTO expenses (item_name, price, currency_id, description, merchant_id, item_id, category_id, sub_category_id, confidence, transcript_id, source, priority, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    expense.item_name,
    expense.price,
    currencyId,
    expense.description ?? '',
    expense.merchant_id ?? null,
    expense.item_id ?? null,
    expense.category_id ?? null,
    expense.sub_category_id ?? null,
    expense.confidence ?? 0,
    expense.transcript_id ?? null,
    expense.source ?? 'voice',
    expense.priority ?? null,
    now,
    now,
  );
  if (profile?.monthly_budget && profile.monthly_budget > 0) {
    await recalculateMonthlySavings(profile.monthly_budget);
  }
  return result.lastInsertRowId as number;
}

export async function insertExpenses(expenses: NewExpense[]): Promise<number[]> {
  const db = await getDb();
  const now = new Date().toISOString();
  const ids: number[] = [];
  // Resolve currency_id from profile (global setting)
  const profile = await db.getFirstAsync<{ currency_id: number; monthly_budget: number }>('SELECT currency_id, monthly_budget FROM profiles LIMIT 1');
  const currencyId = profile?.currency_id ?? 1;

  const statement = await db.prepareAsync(
    `INSERT INTO expenses (item_name, price, currency_id, description, merchant_id, item_id, category_id, sub_category_id, confidence, transcript_id, source, priority, created_at, updated_at)
     VALUES ($item_name, $price, $currency_id, $description, $merchant_id, $item_id, $category_id, $sub_category_id, $confidence, $transcript_id, $source, $priority, $created_at, $updated_at)`,
  );

  try {
    for (const expense of expenses) {
      const result = await statement.executeAsync({
        $item_name: expense.item_name,
        $price: expense.price,
        $currency_id: currencyId,
        $description: expense.description ?? '',
        $merchant_id: expense.merchant_id ?? null,
        $item_id: expense.item_id ?? null,
        $category_id: expense.category_id ?? null,
        $sub_category_id: expense.sub_category_id ?? null,
        $confidence: expense.confidence ?? 0,
        $transcript_id: expense.transcript_id ?? null,
        $source: expense.source ?? 'voice',
        $priority: expense.priority ?? null,
        $created_at: now,
        $updated_at: now,
      });
      ids.push(result.lastInsertRowId as number);
    }
  } finally {
    await statement.finalizeAsync();
  }

  if (profile?.monthly_budget && profile.monthly_budget > 0) {
    await recalculateMonthlySavings(profile.monthly_budget);
  }

  return ids;
}

export async function updateExpense(id: number, data: Partial<Omit<ExpenseRow, 'id' | 'created_at' | 'updated_at' | 'currency_id' | 'merchant_name' | 'item_name_variants' | 'category_name' | 'category_default_priority' | 'sub_category_name'>>): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const setClauses: string[] = [];
  const params: (string | number | null)[] = [];

  const fields: (keyof typeof data)[] = ['item_name', 'price', 'description', 'merchant_id', 'item_id', 'category_id', 'sub_category_id', 'confidence', 'transcript_id', 'source', 'priority'];
  for (const field of fields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      params.push(data[field]);
    }
  }

  if (setClauses.length === 0) return;
  setClauses.push('updated_at = ?');
  params.push(now);
  params.push(id);

  await db.runAsync(`UPDATE expenses SET ${setClauses.join(', ')} WHERE id = ?`, ...params);

  const profile = await db.getFirstAsync<{ monthly_budget: number }>('SELECT monthly_budget FROM profiles LIMIT 1');
  if (profile?.monthly_budget && profile.monthly_budget > 0) {
    await recalculateMonthlySavings(profile.monthly_budget);
  }
}

export async function deleteExpense(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', id);

  const profile = await db.getFirstAsync<{ monthly_budget: number }>('SELECT monthly_budget FROM profiles LIMIT 1');
  if (profile?.monthly_budget && profile.monthly_budget > 0) {
    await recalculateMonthlySavings(profile.monthly_budget);
  }
}

export async function aggregateExpensesForPeriod(
  start: string,
  end: string,
): Promise<{
  totalSpent: number;
  totalTransactions: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  topItems: Array<{ name: string; itemId: number; amount: number; frequency: number; priority: string }>;
  topMerchants: Array<{ name: string; merchantId: number; amount: number; frequency: number }>;
}> {
  const db = await getDb();

  const totals = await db.getFirstAsync<{ total: number; count: number }>(
    `SELECT COALESCE(SUM(price), 0) AS total, COUNT(*) AS count
     FROM expenses
     WHERE created_at >= ? AND created_at <= ?`,
    start,
    end,
  );

  const byCategoryRows = await db.getAllAsync<{ name: string; amount: number }>(
    `SELECT COALESCE(cat.name, 'غير مصنف') AS name, COALESCE(SUM(e.price), 0) AS amount
     FROM expenses e
     LEFT JOIN categories cat ON cat.id = e.category_id
     WHERE e.created_at >= ? AND e.created_at <= ?
     GROUP BY cat.name
     ORDER BY amount DESC`,
    start,
    end,
  );

  const byPriorityRows = await db.getAllAsync<{ priority: string; amount: number }>(
    `SELECT COALESCE(e.priority, cat.default_priority, 'normal') AS priority, COALESCE(SUM(e.price), 0) AS amount
     FROM expenses e
     LEFT JOIN categories cat ON cat.id = e.category_id
     WHERE e.created_at >= ? AND e.created_at <= ?
     GROUP BY COALESCE(e.priority, cat.default_priority, 'normal')
     ORDER BY amount DESC`,
    start,
    end,
  );

  const topItemsRows = await db.getAllAsync<{ name: string; itemId: number | null; amount: number; frequency: number; priority: string }>(
    `SELECT e.item_name AS name, e.item_id AS itemId,
            COALESCE(SUM(e.price), 0) AS amount,
            COUNT(*) AS frequency,
            COALESCE(i.priority, COALESCE(cat.default_priority, 'normal')) AS priority
     FROM expenses e
     LEFT JOIN items i ON i.id = e.item_id
     LEFT JOIN categories cat ON cat.id = e.category_id
     WHERE e.created_at >= ? AND e.created_at <= ?
     GROUP BY e.item_name, e.item_id
     ORDER BY amount DESC
     LIMIT 10`,
    start,
    end,
  );

  const topMerchantsRows = await db.getAllAsync<{ name: string | null; merchantId: number | null; amount: number; frequency: number }>(
    `SELECT COALESCE(m.name, 'أخرى') AS name, e.merchant_id AS merchantId,
            COALESCE(SUM(e.price), 0) AS amount,
            COUNT(*) AS frequency
     FROM expenses e
     LEFT JOIN merchants m ON m.id = e.merchant_id
     WHERE e.created_at >= ? AND e.created_at <= ?
     GROUP BY e.merchant_id
     ORDER BY amount DESC
     LIMIT 10`,
    start,
    end,
  );

  const byCategory: Record<string, number> = {};
  for (const row of byCategoryRows) {
    byCategory[row.name] = row.amount;
  }

  const byPriority: Record<string, number> = {};
  for (const row of byPriorityRows) {
    byPriority[row.priority] = row.amount;
  }

  const topItems = topItemsRows.map((r) => ({
    name: r.name,
    itemId: r.itemId ?? 0,
    amount: r.amount,
    frequency: r.frequency,
    priority: r.priority,
  }));

  const topMerchants = topMerchantsRows.map((r) => ({
    name: r.name ?? 'أخرى',
    merchantId: r.merchantId ?? 0,
    amount: r.amount,
    frequency: r.frequency,
  }));

  return {
    totalSpent: totals?.total ?? 0,
    totalTransactions: totals?.count ?? 0,
    byCategory,
    byPriority,
    topItems,
    topMerchants,
  };
}
