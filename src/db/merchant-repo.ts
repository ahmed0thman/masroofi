import { getDb } from './index';

export interface MerchantRow {
  id: number;
  name: string;
  name_variants: string | null;
  name_en: string | null;
  icon: string | null;
  color: string | null;
  is_active: number;
}

export async function getAllMerchants(): Promise<MerchantRow[]> {
  const db = await getDb();
  return db.getAllAsync<MerchantRow>('SELECT * FROM merchants WHERE is_active = 1 ORDER BY name ASC');
}

export async function getMerchantById(id: number): Promise<MerchantRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<MerchantRow>('SELECT * FROM merchants WHERE id = ?', id);
  return row ?? null;
}

export async function getMerchantByName(name: string): Promise<MerchantRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<MerchantRow>('SELECT * FROM merchants WHERE name = ?', name);
  return row ?? null;
}

export async function createMerchant(data: { name: string; name_variants?: string[] }): Promise<number> {
  const db = await getDb();
  const variants = data.name_variants ? JSON.stringify(data.name_variants) : null;
  const result = await db.runAsync(
    `INSERT INTO merchants (name, name_variants) VALUES (?, ?)`,
    data.name,
    variants,
  );
  return result.lastInsertRowId as number;
}

export async function searchMerchants(query: string, limit: number = 10): Promise<MerchantRow[]> {
  const db = await getDb();
  return db.getAllAsync<MerchantRow>(
    `SELECT * FROM merchants WHERE is_active = 1 AND (name LIKE ? OR name_variants LIKE ?) ORDER BY name ASC LIMIT ?`,
    `%${query}%`,
    `%${query}%`,
    limit,
  );
}
