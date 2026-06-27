import { getDb } from './index';

export interface CategoryRow {
  id: number;
  name: string;
  name_en: string | null;
  icon: string | null;
  color: string | null;
  default_priority: 'essential' | 'important' | 'normal' | 'luxury';
  sort_order: number;
  is_active: number;
}

export interface SubCategoryRow {
  id: number;
  name: string;
  name_en: string | null;
  category_id: number;
  is_active: number;
}

export async function getAllCategories(): Promise<CategoryRow[]> {
  const db = await getDb();
  return db.getAllAsync<CategoryRow>('SELECT * FROM categories ORDER BY sort_order ASC, name ASC');
}

export async function getCategoryById(id: number): Promise<CategoryRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<CategoryRow>('SELECT * FROM categories WHERE id = ?', id);
  return row ?? null;
}

export async function getCategoryByName(name: string): Promise<CategoryRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<CategoryRow>('SELECT * FROM categories WHERE name = ?', name);
  return row ?? null;
}

export async function createCategory(data: { name: string; default_priority?: string; sort_order?: number }): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO categories (name, default_priority, sort_order)
     VALUES (?, ?, ?)`,
    data.name,
    data.default_priority ?? 'normal',
    data.sort_order ?? 99,
  );
  return result.lastInsertRowId as number;
}

export async function getSubCategories(categoryId: number): Promise<SubCategoryRow[]> {
  const db = await getDb();
  return db.getAllAsync<SubCategoryRow>(
    'SELECT * FROM sub_categories WHERE category_id = ? AND is_active = 1 ORDER BY name ASC',
    categoryId,
  );
}

export async function createSubCategory(data: { name: string; category_id: number }): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO sub_categories (name, category_id) VALUES (?, ?)`,
    data.name,
    data.category_id,
  );
  return result.lastInsertRowId as number;
}
