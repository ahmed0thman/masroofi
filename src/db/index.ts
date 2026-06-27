import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const SCHEMA_VERSION = 2;

async function addColumnIfNotExists(table: string, column: string, def: string) {
  try {
    await db!.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
  } catch {}
}

export async function getSchemaVersion(): Promise<number> {
  const d = await getDb();
  const row = await d.getFirstAsync<{ 'user_version': number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

export async function runMigrations(): Promise<void> {
  const d = await getDb();
  const row = await d.getFirstAsync<{ 'user_version': number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion >= SCHEMA_VERSION) return;
  await migrateToV2();
}

export async function migrateToV2() {
  const expensesColumns = await db!.getAllAsync<{ name: string }>("PRAGMA table_info('expenses')");
  const hasOldExpenses = expensesColumns.length > 0 && !expensesColumns.some(c => c.name === 'item_name');

  if (hasOldExpenses) {
    const oldTableStillExists = await db!.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='expenses_old'",
    );
    if (!oldTableStillExists) {
      await db!.execAsync('ALTER TABLE expenses RENAME TO expenses_old');
    }
  }

  await createV2Tables();

  await db!.execAsync('BEGIN');
  try {
    await seedCurrencies();
    await seedCategories();
    await seedWordEquivalences();

    const hasExpensesOld = await db!.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='expenses_old'",
    );
    if (hasExpensesOld) {
      await migrateExpensesData();
    }

    await db!.execAsync('PRAGMA user_version = 2');
    await db!.execAsync('COMMIT');
  } catch (e) {
    await db!.execAsync('ROLLBACK');
    throw e;
  }
}

async function createV2Tables() {
  await db!.execAsync(`
    CREATE TABLE IF NOT EXISTS currencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      symbol TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db!.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      name_en TEXT,
      icon TEXT,
      color TEXT,
      default_priority TEXT NOT NULL DEFAULT 'normal' CHECK(default_priority IN ('essential', 'important', 'normal', 'luxury')),
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db!.execAsync(`
    CREATE TABLE IF NOT EXISTS sub_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_en TEXT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(name, category_id)
    )
  `);

  await db!.execAsync(`
    CREATE TABLE IF NOT EXISTS merchants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      name_variants TEXT,
      name_en TEXT,
      icon TEXT,
      color TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db!.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_variants TEXT,
      canonical_item_id INTEGER REFERENCES items(id),
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      sub_category_id INTEGER REFERENCES sub_categories(id) ON DELETE SET NULL,
      merchant_id INTEGER REFERENCES merchants(id) ON DELETE SET NULL,
      priority TEXT CHECK(priority IN ('essential', 'important', 'normal', 'luxury')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db!.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      price REAL NOT NULL,
      currency_id INTEGER NOT NULL REFERENCES currencies(id),
      description TEXT NOT NULL DEFAULT '',
      merchant_id INTEGER REFERENCES merchants(id) ON DELETE SET NULL,
      item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      sub_category_id INTEGER REFERENCES sub_categories(id) ON DELETE SET NULL,
      confidence REAL NOT NULL DEFAULT 0,
      transcript_id TEXT REFERENCES recordings(id) ON DELETE SET NULL,
      source TEXT NOT NULL DEFAULT 'voice',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await db!.execAsync(`
    CREATE TABLE IF NOT EXISTS change_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      row_id INTEGER NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('CREATE', 'UPDATE', 'MERGE', 'DELETE')),
      old_data TEXT,
      new_data TEXT,
      source TEXT NOT NULL DEFAULT 'system',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db!.execAsync(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      period_type TEXT NOT NULL DEFAULT 'weekly' CHECK(period_type IN ('weekly', 'monthly', 'custom')),
      generated_at TEXT NOT NULL,
      data TEXT NOT NULL,
      insights TEXT,
      recommendations TEXT,
      status TEXT NOT NULL DEFAULT 'completed',
      token_estimate INTEGER,
      model_used TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db!.execAsync(`
    CREATE TABLE IF NOT EXISTS word_equivalences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      canonical TEXT NOT NULL,
      variant TEXT NOT NULL,
      dialect TEXT,
      source TEXT NOT NULL DEFAULT 'system',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db!.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_we_variant ON word_equivalences(variant)
  `);

  await db!.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_we_canonical ON word_equivalences(canonical)
  `);
}

async function seedCurrencies() {
  const count = await db!.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM currencies');
  if (count!.c > 0) return;

  await db!.execAsync(`
    INSERT INTO currencies (code, name_ar, name_en, symbol, is_default) VALUES
      ('EGP', 'جنيه مصري', 'Egyptian Pound', 'ج.م', 1),
      ('USD', 'دولار أمريكي', 'US Dollar', '$', 0),
      ('SAR', 'ريال سعودي', 'Saudi Riyal', 'ر.س', 0),
      ('EUR', 'يورو', 'Euro', '€', 0)
  `);
}

async function seedCategories() {
  const count = await db!.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM categories');
  if (count!.c > 0) return;

  await db!.execAsync(`
    INSERT INTO categories (name, default_priority, sort_order) VALUES
      ('أكل ومشروبات', 'essential', 1),
      ('مواصلات', 'important', 2),
      ('فواتير', 'essential', 3),
      ('تسوق', 'normal', 4),
      ('صحة', 'essential', 5),
      ('ترفيه', 'luxury', 6),
      ('تعليم', 'important', 7),
      ('إيجار', 'essential', 8),
      ('أخرى', 'normal', 99)
  `);
}

async function seedWordEquivalences() {
  const count = await db!.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM word_equivalences');
  if (count!.c > 0) return;

  const equivalences = [
    { canonical: 'عيش', variant: 'خبز', dialect: 'egyptian' },
    { canonical: 'عيش', variant: 'عيشة', dialect: 'egyptian' },
    { canonical: 'عيش', variant: 'خبزة', dialect: 'levant' },
    { canonical: 'حليب', variant: 'لبن', dialect: 'levant' },
    { canonical: 'حليب', variant: 'لبنة', dialect: 'levant' },
    { canonical: 'حليب', variant: 'حليبة', dialect: 'gulf' },
    { canonical: 'جبنة', variant: 'جبن', dialect: 'levant' },
    { canonical: 'جبنة', variant: 'جبنة بيضا', dialect: 'egyptian' },
    { canonical: 'لحمة', variant: 'لحم', dialect: 'levant' },
    { canonical: 'لحمة', variant: 'لحمة مفرومة', dialect: 'egyptian' },
    { canonical: 'فراخ', variant: 'دجاج', dialect: 'levant' },
    { canonical: 'فراخ', variant: 'فرخة', dialect: 'egyptian' },
    { canonical: 'فراخ', variant: 'كتكوت', dialect: 'egyptian' },
    { canonical: 'بطاطس', variant: 'بطاطا', dialect: 'levant' },
    { canonical: 'طماطم', variant: 'قوطة', dialect: 'egyptian' },
    { canonical: 'بصل', variant: 'بصلة', dialect: 'egyptian' },
    { canonical: 'بصل', variant: 'بصل اخضر', dialect: 'levant' },
    { canonical: 'موز', variant: 'وز', dialect: 'egyptian' },
    { canonical: 'برتقال', variant: 'يوسفي', dialect: 'levant' },
    { canonical: 'برتقال', variant: 'بوصفير', dialect: 'egyptian' },
    { canonical: 'زبادي', variant: 'روب', dialect: 'gulf' },
    { canonical: 'زبادي', variant: 'لبن زبادي', dialect: 'egyptian' },
    { canonical: 'بيض', variant: 'بيضات', dialect: 'egyptian' },
    { canonical: 'زيت', variant: 'زيت طعام', dialect: 'egyptian' },
    { canonical: 'زيت', variant: 'زيت نباتي', dialect: 'levant' },
    { canonical: 'سكر', variant: 'سكارة', dialect: 'egyptian' },
    { canonical: 'شاي', variant: 'شاهي', dialect: 'levant' },
    { canonical: 'قهوة', variant: 'نسكافيه', dialect: 'egyptian' },
    { canonical: 'رز', variant: 'أرز', dialect: 'levant' },
    { canonical: 'مكرونة', variant: 'باستا', dialect: 'levant' },
    { canonical: 'فول', variant: 'فول مدشوش', dialect: 'egyptian' },
    { canonical: 'بنزين', variant: 'وقود', dialect: 'levant' },
    { canonical: 'بنزين', variant: 'سولار', dialect: 'egyptian' },
    { canonical: 'مواصلات', variant: 'انتقالات', dialect: 'levant' },
    { canonical: 'مواصلات', variant: 'طلوع ونزول', dialect: 'egyptian' },
    { canonical: 'تاكسي', variant: 'أوبر', dialect: 'egyptian' },
    { canonical: 'تاكسي', variant: 'كريم', dialect: 'egyptian' },
    { canonical: 'تاكسي', variant: 'تكسي', dialect: 'gulf' },
    { canonical: 'مترو', variant: 'مترو أنفاق', dialect: 'egyptian' },
    { canonical: 'أتوبيس', variant: 'باص', dialect: 'levant' },
    { canonical: 'أتوبيس', variant: 'حافلة', dialect: 'gulf' },
    { canonical: 'ميكروباص', variant: 'ربع نقل', dialect: 'egyptian' },
    { canonical: 'قطار', variant: 'ترين', dialect: 'gulf' },
    { canonical: 'صيانة', variant: 'صيانة عربية', dialect: 'egyptian' },
    { canonical: 'صيانة', variant: 'تصليح عربية', dialect: 'levant' },
    { canonical: 'كهرباء', variant: 'كهربا', dialect: 'egyptian' },
    { canonical: 'كهرباء', variant: 'فاتورة كهرباء', dialect: 'levant' },
    { canonical: 'مياه', variant: 'ماية', dialect: 'egyptian' },
    { canonical: 'مياه', variant: 'ميه', dialect: 'egyptian' },
    { canonical: 'مياه', variant: 'فاتورة مياه', dialect: 'levant' },
    { canonical: 'غاز', variant: 'غاز طبيعي', dialect: 'levant' },
    { canonical: 'تليفون', variant: 'تلفون', dialect: 'egyptian' },
    { canonical: 'تليفون', variant: 'موبايل', dialect: 'levant' },
    { canonical: 'نت', variant: 'إنترنت', dialect: 'levant' },
    { canonical: 'نت', variant: 'نت النت', dialect: 'egyptian' },
    { canonical: 'اشتراكات', variant: 'تجديد اشتراك', dialect: 'egyptian' },
    { canonical: 'إيجار', variant: 'أجرة شقة', dialect: 'egyptian' },
    { canonical: 'صيانة منزل', variant: 'سباك', dialect: 'egyptian' },
    { canonical: 'صيانة منزل', variant: 'كهربائي', dialect: 'egyptian' },
    { canonical: 'ملابس', variant: 'هدوم', dialect: 'egyptian' },
    { canonical: 'أحذية', variant: 'جزمة', dialect: 'egyptian' },
    { canonical: 'أحذية', variant: 'كوتشي', dialect: 'egyptian' },
    { canonical: 'أحذية', variant: 'حذاء', dialect: 'levant' },
    { canonical: 'أدوات منزلية', variant: 'مستلزمات', dialect: 'egyptian' },
    { canonical: 'إلكترونيات', variant: 'أجهزة', dialect: 'levant' },
    { canonical: 'أدوات تنظيف', variant: 'مستلزمات تنظيف', dialect: 'egyptian' },
    { canonical: 'أدوات تنظيف', variant: 'صابون', dialect: 'egyptian' },
    { canonical: 'هدايا', variant: 'هدية', dialect: 'levant' },
    { canonical: 'مستحضرات تجميل', variant: 'ميكاب', dialect: 'egyptian' },
    { canonical: 'مستحضرات تجميل', variant: 'أدوات تجميل', dialect: 'levant' },
    { canonical: 'عطور', variant: 'برفان', dialect: 'gulf' },
    { canonical: 'دكتور', variant: 'طبيب', dialect: 'levant' },
    { canonical: 'دكتور', variant: 'كشف', dialect: 'egyptian' },
    { canonical: 'صيدلية', variant: 'أدوية', dialect: 'levant' },
    { canonical: 'صيدلية', variant: 'علاج', dialect: 'egyptian' },
    { canonical: 'جيم', variant: 'نادي رياضي', dialect: 'levant' },
    { canonical: 'جيم', variant: 'صالة رياضة', dialect: 'egyptian' },
    { canonical: 'مستشفى', variant: 'مشفى', dialect: 'levant' },
    { canonical: 'تحاليل', variant: 'أشعة', dialect: 'egyptian' },
    { canonical: 'أسنان', variant: 'دكتور أسنان', dialect: 'egyptian' },
    { canonical: 'أسنان', variant: 'سنان', dialect: 'egyptian' },
    { canonical: 'نظارات', variant: 'نضارة', dialect: 'egyptian' },
    { canonical: 'عملية', variant: 'جراحة', dialect: 'levant' },
    { canonical: 'سينما', variant: 'أفلام', dialect: 'egyptian' },
    { canonical: 'مطعم', variant: 'أكل برة', dialect: 'egyptian' },
    { canonical: 'مطعم', variant: 'رستوران', dialect: 'levant' },
    { canonical: 'سفر', variant: 'سياحة', dialect: 'levant' },
    { canonical: 'سفر', variant: 'رحلة', dialect: 'egyptian' },
    { canonical: 'هوايات', variant: 'أنشطة', dialect: 'levant' },
    { canonical: 'فلوس', variant: 'مصاري', dialect: 'levant' },
    { canonical: 'فلوس', variant: 'دراهم', dialect: 'gulf' },
    { canonical: 'فلوس', variant: 'نقود', dialect: 'levant' },
    { canonical: 'تسوق', variant: 'شوبينج', dialect: 'egyptian' },
    { canonical: 'دفع', variant: 'كاش', dialect: 'egyptian' },
    { canonical: 'دفع', variant: 'نقدي', dialect: 'egyptian' },
    { canonical: 'دفع', variant: 'كريدت', dialect: 'egyptian' },
    { canonical: 'دفع', variant: 'بطاقة', dialect: 'levant' },
    { canonical: 'توصيل', variant: 'دليفري', dialect: 'egyptian' },
  ];

  const stmt = await db!.prepareAsync(
    'INSERT INTO word_equivalences (canonical, variant, dialect, source) VALUES (?, ?, ?, ?)',
  );
  try {
    for (const eq of equivalences) {
      await stmt.executeAsync(eq.canonical, eq.variant, eq.dialect, 'system');
    }
  } finally {
    await stmt.finalizeAsync();
  }
}

type OldExpenseRow = {
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
};

async function migrateExpensesData() {
  const rows = await db!.getAllAsync<OldExpenseRow>('SELECT * FROM expenses_old');
  if (rows.length === 0) return;

  const currencyMap = await buildCurrencyMap();
  const categoryCache = new Map<string, number>();
  const subCategoryCache = new Map<string, number>();
  const merchantCache = new Map<string, number>();
  const itemCache = new Map<string, number>();

  for (const row of rows) {
    const currencyId = currencyMap.get(normalizeCurrency(row.currency)) ?? 1;

    const categoryId = await resolveCategoryId(row.main_category, categoryCache);
    const subCategoryId = categoryId
      ? await resolveSubCategoryId(row.sub_category, categoryId, subCategoryCache)
      : null;
    const merchantId = row.merchant
      ? await resolveMerchantId(row.merchant, merchantCache)
      : null;
    const itemId = row.item
      ? await resolveItemId(row.item, categoryId, subCategoryId, merchantId, itemCache)
      : null;

    await db!.runAsync(
      `INSERT INTO expenses (item_name, price, currency_id, description, merchant_id, item_id, category_id, sub_category_id, confidence, transcript_id, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'voice', ?, ?)`,
      row.item,
      row.price,
      currencyId,
      row.description || '',
      merchantId,
      itemId,
      categoryId,
      subCategoryId,
      row.confidence ?? 0,
      row.transcript_id ?? null,
      row.created_at,
      row.updated_at,
    );
  }
}

function normalizeCurrency(currency: string): string {
  const c = currency?.trim().toLowerCase() || '';
  if (c === 'egp' || c === 'جنيه' || c === 'جنيه مصري' || c === 'ج.م' || c === '') return 'جنيه مصري';
  if (c === 'usd' || c === 'دولار' || c === 'دولار أمريكي' || c === '$') return 'دولار أمريكي';
  if (c === 'sar' || c === 'ريال' || c === 'ريال سعودي' || c === 'ر.س') return 'ريال سعودي';
  if (c === 'eur' || c === 'يورو' || c === '€') return 'يورو';
  return c;
}

async function buildCurrencyMap(): Promise<Map<string, number>> {
  const currencies = await db!.getAllAsync<{ id: number; name_ar: string; name_en: string; code: string }>(
    'SELECT id, name_ar, name_en, code FROM currencies',
  );
  const map = new Map<string, number>();
  for (const c of currencies) {
    map.set(c.name_ar, c.id);
    map.set(c.name_en, c.id);
    map.set(c.code, c.id);
    map.set(c.name_ar.toLowerCase(), c.id);
    map.set(c.name_en.toLowerCase(), c.id);
    map.set(c.code.toLowerCase(), c.id);
  }
  return map;
}

async function resolveCategoryId(name: string | null, cache: Map<string, number>): Promise<number | null> {
  if (!name || !name.trim()) return null;
  const key = name.trim();
  if (cache.has(key)) return cache.get(key)!;

  await db!.runAsync(
    `INSERT OR IGNORE INTO categories (name, default_priority, sort_order, created_at, updated_at)
     VALUES (?, 'normal', 99, datetime('now'), datetime('now'))`,
    key,
  );
  const row = await db!.getFirstAsync<{ id: number }>(
    'SELECT id FROM categories WHERE name = ? LIMIT 1',
    key,
  );
  if (row) {
    cache.set(key, row.id);
    return row.id;
  }
  return null;
}

async function resolveSubCategoryId(name: string | null, categoryId: number, cache: Map<string, number>): Promise<number | null> {
  if (!name || !name.trim()) return null;
  const key = `${name.trim()}:${categoryId}`;
  if (cache.has(key)) return cache.get(key)!;

  await db!.runAsync(
    `INSERT OR IGNORE INTO sub_categories (name, category_id, created_at, updated_at)
     VALUES (?, ?, datetime('now'), datetime('now'))`,
    name.trim(),
    categoryId,
  );
  const row = await db!.getFirstAsync<{ id: number }>(
    'SELECT id FROM sub_categories WHERE name = ? AND category_id = ? LIMIT 1',
    name.trim(),
    categoryId,
  );
  if (row) {
    cache.set(key, row.id);
    return row.id;
  }
  return null;
}

async function resolveMerchantId(name: string, cache: Map<string, number>): Promise<number | null> {
  const key = name.trim();
  if (cache.has(key)) return cache.get(key)!;

  await db!.runAsync(
    `INSERT OR IGNORE INTO merchants (name, name_variants, created_at, updated_at)
     VALUES (?, ?, datetime('now'), datetime('now'))`,
    key,
    JSON.stringify([key]),
  );
  const row = await db!.getFirstAsync<{ id: number }>(
    'SELECT id FROM merchants WHERE name = ? LIMIT 1',
    key,
  );
  if (row) {
    cache.set(key, row.id);
    return row.id;
  }
  return null;
}

async function resolveItemId(
  name: string,
  categoryId: number | null,
  subCategoryId: number | null,
  merchantId: number | null,
  cache: Map<string, number>,
): Promise<number | null> {
  const key = name.trim();
  if (cache.has(key)) return cache.get(key)!;

  let row = await db!.getFirstAsync<{ id: number }>(
    'SELECT id FROM items WHERE name = ? LIMIT 1',
    key,
  );

  if (!row) {
    await db!.runAsync(
      `INSERT INTO items (name, category_id, sub_category_id, merchant_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      key,
      categoryId,
      subCategoryId,
      merchantId,
    );
    row = await db!.getFirstAsync<{ id: number }>(
      'SELECT id FROM items WHERE name = ? LIMIT 1',
      key,
    );
  }

  if (row) {
    cache.set(key, row.id);
    return row.id;
  }
  return null;
}

export async function seedIfEmpty(): Promise<void> {
  const d = await getDb();
  const curCount = await d.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM currencies');
  if (curCount!.c === 0) {
    await seedCurrencies();
  }
  const catCount = await d.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM categories');
  if (catCount!.c === 0) {
    await seedCategories();
  }
  const weCount = await d.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM word_equivalences');
  if (weCount!.c === 0) {
    await seedWordEquivalences();
  }
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('masroofi.db');

  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      avatar_uri TEXT,
      language TEXT NOT NULL DEFAULT 'ar',
      theme TEXT NOT NULL DEFAULT 'system',
      reminders_enabled INTEGER NOT NULL DEFAULT 1,
      user_type TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await addColumnIfNotExists('profiles', 'gender', "TEXT DEFAULT ''");
  await addColumnIfNotExists('profiles', 'location', "TEXT DEFAULT ''");
  await addColumnIfNotExists('profiles', 'age', 'INTEGER DEFAULT 0');
  await addColumnIfNotExists('profiles', 'user_type', "TEXT NOT NULL DEFAULT 'user'");
  await addColumnIfNotExists('profiles', 'analytics_day', 'INTEGER DEFAULT 5');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recordings (
      id TEXT PRIMARY KEY,
      transcript TEXT NOT NULL,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT NOT NULL,
      meridiem TEXT NOT NULL DEFAULT 'PM',
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `);

  await runMigrations();

  return db;
}
