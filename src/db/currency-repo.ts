import { getDb } from './index';

export interface CurrencyRow {
  id: number;
  code: string;
  name_ar: string;
  name_en: string;
  symbol: string;
  is_default: number;
}

export async function getAllCurrencies(): Promise<CurrencyRow[]> {
  const db = await getDb();
  return db.getAllAsync<CurrencyRow>('SELECT * FROM currencies ORDER BY is_default DESC, code ASC');
}

export async function getDefaultCurrency(): Promise<CurrencyRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<CurrencyRow>('SELECT * FROM currencies WHERE is_default = 1 LIMIT 1');
  return row ?? null;
}

export async function getCurrencyById(id: number): Promise<CurrencyRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<CurrencyRow>('SELECT * FROM currencies WHERE id = ?', id);
  return row ?? null;
}

export async function getCurrencyByCode(code: string): Promise<CurrencyRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<CurrencyRow>('SELECT * FROM currencies WHERE code = ?', code);
  return row ?? null;
}

export async function createCurrency(data: Omit<CurrencyRow, 'id'>): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO currencies (code, name_ar, name_en, symbol, is_default)
     VALUES (?, ?, ?, ?, ?)`,
    data.code,
    data.name_ar,
    data.name_en,
    data.symbol,
    data.is_default,
  );
  return result.lastInsertRowId as number;
}
