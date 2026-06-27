import { getDb } from './index';

export interface ItemRow {
  id: number;
  name: string;
  name_variants: string | null;
  canonical_item_id: number | null;
  category_id: number | null;
  sub_category_id: number | null;
  merchant_id: number | null;
  priority: string | null;
  is_active: number;
}

export async function getAllItems(): Promise<ItemRow[]> {
  const db = await getDb();
  return db.getAllAsync<ItemRow>('SELECT * FROM items WHERE is_active = 1 ORDER BY name ASC');
}

export async function getItemById(id: number): Promise<ItemRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ItemRow>('SELECT * FROM items WHERE id = ?', id);
  return row ?? null;
}

export async function getItemByName(name: string): Promise<ItemRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ItemRow>('SELECT * FROM items WHERE name = ?', name);
  return row ?? null;
}

export async function createItem(data: {
  name: string;
  category_id?: number | null;
  sub_category_id?: number | null;
  merchant_id?: number | null;
  priority?: string | null;
}): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO items (name, category_id, sub_category_id, merchant_id, priority)
     VALUES (?, ?, ?, ?, ?)`,
    data.name,
    data.category_id ?? null,
    data.sub_category_id ?? null,
    data.merchant_id ?? null,
    data.priority ?? null,
  );
  return result.lastInsertRowId as number;
}

export async function searchItems(query: string, limit: number = 10): Promise<ItemRow[]> {
  const db = await getDb();
  return db.getAllAsync<ItemRow>(
    `SELECT * FROM items WHERE is_active = 1 AND (name LIKE ? OR name_variants LIKE ?) ORDER BY name ASC LIMIT ?`,
    `%${query}%`,
    `%${query}%`,
    limit,
  );
}

export async function getTopItemsForPrompt(
  limit: number = 10,
): Promise<Array<{ id: number; name: string; name_variants: string | null; category: string; subCategory: string }>> {
  const db = await getDb();
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  return db.getAllAsync<{ id: number; name: string; name_variants: string | null; category: string; subCategory: string }>(
    `SELECT i.id, i.name, i.name_variants,
            COALESCE(c.name, '') AS category,
            COALESCE(sc.name, '') AS subCategory
     FROM items i
     LEFT JOIN categories c ON c.id = i.category_id
     LEFT JOIN sub_categories sc ON sc.id = i.sub_category_id
     LEFT JOIN expenses e ON e.item_id = i.id AND e.created_at >= ?
     WHERE i.is_active = 1
     GROUP BY i.id
     ORDER BY COUNT(e.id) DESC, i.name ASC
     LIMIT ?`,
    ninetyDaysAgo,
    limit,
  );
}
